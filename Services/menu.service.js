const { Op } = require("sequelize");
const { Menu, ClientMenu, Client } = require("../Database/Models");
const { isUnique, create, createMany, read, remove, updateOne } = require("../Helpers/crud.helper");
const { generateCustomError } = require("../Helpers/error.helper");
const { withTransaction } = require("../Helpers/transaction.helper");

const MENU_FIELDS = ["id", "parentId", "key", "title", "icon", "path", "sortOrder", "isActive"];
const MENU_ORDER = [
  ["sortOrder", "ASC"],
  ["id", "ASC"],
];

/**
 * NOTE: menus are global (public.menus), super admin gives some of them to a client
 * (public.client_menus) and every user of that client sees exactly those menus
 */

/**
 * @description flat rows (already sorted) -> nested tree [{ ...menu, children: [] }]
 * child whose parent is not in the list (not given / inactive) is hidden too
 */
function buildTree(menus) {
  const nodes = new Map(menus.map((menu) => [menu.id, { ...menu, children: [] }]));
  const tree = [];

  nodes.forEach((node) => {
    if (!node.parentId) tree.push(node);
    else nodes.get(node.parentId)?.children.push(node);
  });

  return tree;
}

async function findMenus(where = {}, include = []) {
  return Menu.findAll({ where, attributes: MENU_FIELDS, include, order: MENU_ORDER, raw: true });
}

async function getClient(clientId) {
  const client = await read(Client, { id: clientId }, ["id"]);

  if (!client) generateCustomError("client not found", "not_found", 404, "clientNotFound");

  return client;
}

/**
 * @description parent must exist and must not be the menu itself or one of its children (loop)
 * @param id menu being updated (undefined on create)
 */
async function validateParent(id, parentId) {
  let current = await read(Menu, { id: parentId }, ["id", "parentId"]);

  if (!current)
    generateCustomError("parent menu not found", "validation_error", 400, "parentNotFound");

  while (current) {
    if (current.id === id)
      generateCustomError("menu can't be its own parent", "validation_error", 400, "invalidParent");

    current = current.parentId
      ? await read(Menu, { id: current.parentId }, ["id", "parentId"])
      : null;
  }
}

//? super admin -> all menus (active + inactive) as tree
async function list() {
  return buildTree(await findMenus());
}

async function getById(id) {
  const menu = await read(Menu, { id }, MENU_FIELDS);

  if (!menu) generateCustomError("menu not found", "not_found", 404, "menuNotFound");

  return menu;
}

async function createMenu(data) {
  return withTransaction(async () => {
    await isUnique(Menu, { key: data.key });
    if (data.parentId) await validateParent(undefined, data.parentId);

    const menu = await create(Menu, data);

    return getById(menu.id);
  });
}

async function updateMenu(id, data) {
  return withTransaction(async () => {
    if (data.key) await isUnique(Menu, { key: data.key, id: { [Op.ne]: id } });
    if (data.parentId) await validateParent(id, data.parentId);

    await updateOne(Menu, { id }, data);

    return getById(id);
  });
}

//? child menus + client mappings are removed too (ON DELETE CASCADE)
async function removeMenu(id) {
  const deletedCount = await remove(Menu, { id });

  if (!deletedCount) generateCustomError("menu not found", "not_found", 404, "menuNotFound");
}

async function getClientMenuIds(clientId) {
  await getClient(clientId);

  const rows = await ClientMenu.findAll({ where: { clientId }, attributes: ["menuId"], raw: true });

  return rows.map((row) => row.menuId);
}

/**
 * @description replaces all menus of client with given list
 * parents of given menus are added automatically, so the tree never breaks
 * @returns final menu ids of client
 */
async function setClientMenus(clientId, menuIds) {
  return withTransaction(async () => {
    await getClient(clientId);

    const allMenus = new Map(
      (await Menu.findAll({ attributes: ["id", "parentId"], raw: true })).map((menu) => [
        menu.id,
        menu,
      ])
    );
    const finalIds = new Set();

    menuIds.forEach((menuId) => {
      if (!allMenus.has(menuId))
        generateCustomError(`menu ${menuId} not found`, "validation_error", 400, "menuNotFound");

      for (let id = menuId; id && !finalIds.has(id); id = allMenus.get(id).parentId)
        finalIds.add(id);
    });

    await remove(ClientMenu, { clientId });
    await createMany(
      ClientMenu,
      [...finalIds].map((menuId) => ({ clientId, menuId }))
    );

    return [...finalIds];
  });
}

/**
 * @description menus of logged in user as tree (for frontend sidebar)
 * super admin (no client) -> all active menus, client user -> active menus given to its client
 */
async function getMyMenus({ clientId }) {
  const include = clientId
    ? [{ model: ClientMenu, as: "clientMenus", where: { clientId }, attributes: [] }]
    : [];

  return buildTree(await findMenus({ isActive: true }, include));
}

module.exports = {
  list,
  getById,
  createMenu,
  updateMenu,
  removeMenu,
  getClientMenuIds,
  setClientMenus,
  getMyMenus,
};
