const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const dist = path.resolve(__dirname, '../dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req,res) => {
  const relative = new URL(req.url, 'http://localhost').pathname;
  let file = path.join(dist, relative);
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); fs.createReadStream(file).pipe(res);
});
const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><ellipse cx="120" cy="60" rx="95" ry="40" fill="#7045aa"/><ellipse cx="120" cy="45" rx="90" ry="25" fill="#b08be8"/></svg>');
const baseIngredient = { proteins: 10, fat: 5, carbohydrates: 20, calories: 200, image, image_large: image, image_mobile: image };
const ingredients = [
  { ...baseIngredient, _id: 'bun', name: 'Тестовая булка', type: 'bun', price: 100 },
  { ...baseIngredient, _id: 'main', name: 'Тестовая начинка', type: 'main', price: 50 },
  { ...baseIngredient, _id: 'sauce', name: 'Тестовый соус', type: 'sauce', price: 20 }
];
let user = { name: 'Тест', email: 'test@example.com' };
const order = { _id: 'order', number: 42, name: 'Космический бургер', ingredients: ['bun','main','bun'], status: 'done', createdAt: '2026-10-15T10:00:00Z', updatedAt: '2026-10-15T10:00:00Z' };
let orders = [order]; let posts = 0; let failOrder = false; let failIngredients = false; const patches = []; const calls = [];
const authData = () => ({ success: true, user, accessToken: 'Bearer test-access', refreshToken: 'test-refresh' });
let browser;
const checks = [];
fs.mkdirSync(path.join(__dirname, '../.test-results'), { recursive: true });
async function check(name, run) { await run(); checks.push(name); console.log('PASS', name); }
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('**/api/**', async route => {
    const request = route.request(); const url = new URL(request.url()); const endpoint = url.pathname.replace('/api',''); const method = request.method(); calls.push({ endpoint, method });
    let data = { success: true }; let status = 200;
    if (endpoint === '/ingredients') { if (failIngredients) { data = { success: false, message: 'Ошибка ингредиентов' }; status = 500; } else data = { success: true, data: ingredients }; }
    else if (endpoint === '/orders/all') data = { success: true, orders, total: 12345, totalToday: 25 };
    else if (endpoint === '/orders' && method === 'GET') data = { success: true, orders };
    else if (endpoint === '/orders' && method === 'POST') {
      posts++; assert.deepEqual(request.postDataJSON().ingredients, ['bun','main','bun']);
      await new Promise(r => setTimeout(r, 150));
      if (failOrder) { status = 500; data = { success: false, message: 'Заказ не принят' }; } else data = { success: true, order, name: order.name };
    }
    else if (/^\/orders\/\d+$/.test(endpoint)) data = { success: true, orders: endpoint.endsWith('/42') ? [order] : [] };
    else if (endpoint === '/auth/login' || endpoint === '/auth/register' || endpoint === '/auth/token') data = authData();
    else if (endpoint === '/auth/user') { if (method === 'PATCH') { const body = request.postDataJSON(); patches.push(body); user = { ...user, ...body }; } data = { success: true, user }; }
    else if (!['/auth/logout','/password-reset','/password-reset/reset'].includes(endpoint)) throw new Error(`Unexpected mock request ${method} ${endpoint}`);
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
  });
  const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push(m.text()); });
  const visible = async (locator) => { await locator.waitFor({ state: 'visible' }); };
  const add = async (name) => { await page.locator('li').filter({ has: page.getByRole('link', { name: new RegExp(name) }) }).getByRole('button', { name: 'Добавить' }).click(); };
  await check('constructor loads, ingredient modal closes with Escape and overlay', async () => {
    await page.goto(origin); await visible(page.getByRole('heading', { name: 'Соберите бургер' })); await page.screenshot({ path: path.join(__dirname, '../.test-results/constructor.png') });
    await page.getByRole('link', { name: /Тестовая булка/ }).click(); await visible(page.getByRole('dialog')); assert.equal(new URL(page.url()).pathname, '/ingredients/bun');
    await page.keyboard.press('Escape'); await page.waitForURL(origin + '/');
    await page.getByRole('link', { name: /Тестовая булка/ }).click(); await visible(page.getByRole('dialog')); await page.mouse.click(5, 500); await page.waitForURL(origin + '/');
  });
  await check('reload of modal URL opens full detail page; missing ingredient has an empty state', async () => {
    await page.getByRole('link', { name: /Тестовая булка/ }).click(); await page.reload(); await visible(page.getByRole('heading', { name: 'Детали ингредиента', exact: true })); assert.equal(await page.getByRole('dialog').count(), 0);
    await page.goto(origin + '/ingredients/missing'); await visible(page.getByText('Ингредиент не найден'));
  });
  await check('duplicate ingredients, counters, price, keyboard move and removal', async () => {
    await page.goto(origin); await add('Тестовая булка'); await add('Тестовая начинка'); await add('Тестовый соус'); await add('Тестовая начинка');
    const items = page.getByTestId('constructor-item'); assert.equal(await items.count(), 3);
    assert.ok(await page.locator('section').filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) }).getByText('320', { exact: true }).isVisible());
    await items.nth(1).getByRole('button', { name: 'Переместить вверх: Тестовый соус', exact: true }).focus(); await page.keyboard.press('Enter');
    assert.equal(await items.nth(0).locator('.constructor-element__text').innerText(), 'Тестовый соус');
    await items.nth(0).getByRole('button', { name: 'Удалить: Тестовый соус', exact: true }).focus(); await page.keyboard.press('Enter'); assert.equal(await items.count(), 2);
    await items.nth(0).getByRole('button', { name: 'Удалить: Тестовая начинка', exact: true }).click(); assert.equal(await items.count(), 1);
  });
  await check('guest constructor survives login and order failure; successful order clears it', async () => {
    await page.goto(origin); await add('Тестовая булка'); await add('Тестовая начинка');
    await page.getByRole('button', { name: 'Оформить заказ' }).click(); await page.waitForURL('**/login');
    await page.getByLabel('E-mail').fill('test@example.com'); await page.getByLabel('Пароль', { exact: true }).fill('password'); await page.getByRole('button', { name: 'Войти', exact: true }).click(); await page.waitForURL(origin + '/');
    failOrder = true; await page.getByRole('button', { name: 'Оформить заказ' }).click(); await visible(page.getByRole('alert')); assert.ok(await page.getByText('Тестовая булка (верх)', { exact: true }).isVisible());
    failOrder = false; await page.getByRole('button', { name: 'Оформить заказ' }).dblclick(); await visible(page.getByText('идентификатор заказа')); assert.equal(posts, 2); await page.getByRole('button', { name: 'Закрыть' }).click(); assert.equal(await page.getByText('Тестовая булка (верх)', { exact: true }).count(), 0);
  });
  await check('profile edits cancel and save; blank password is omitted; session survives reload', async () => {
    await page.goto(origin + '/profile'); await visible(page.getByLabel('Имя', { exact: true })); await page.screenshot({ path: path.join(__dirname, '../.test-results/profile.png') }); await page.getByLabel('Имя', { exact: true }).fill('Изменено'); await page.getByRole('button', { name: 'Отмена', exact: true }).click(); assert.equal(await page.getByLabel('Имя', { exact: true }).inputValue(), 'Тест');
    await page.getByLabel('Имя', { exact: true }).fill('Новое имя'); await page.getByRole('button', { name: 'Сохранить', exact: true }).click(); await page.getByRole('button', { name: 'Сохранить', exact: true }).waitFor({ state: 'hidden' }); assert.deepEqual(patches.at(-1), { name: 'Новое имя' });
    await page.reload(); await visible(page.getByLabel('Имя', { exact: true })); assert.equal(await page.getByLabel('Имя', { exact: true }).inputValue(), 'Новое имя');
  });
  await check('feed statistics, price, order modal and direct order details', async () => {
    await page.getByRole('link', { name: 'Лента заказов', exact: true }).click(); await visible(page.getByText('12345', { exact: true })); await visible(page.getByText('250', { exact: true })); await page.screenshot({ path: path.join(__dirname, '../.test-results/feed.png') });
    await page.getByRole('link', { name: /Космический бургер/ }).click(); await visible(page.getByRole('dialog')); await visible(page.getByText('Выполнен', { exact: true })); assert.equal(await page.getByRole('link', { name: 'Лента заказов', exact: true }).getAttribute('aria-current'), 'page');
    await page.getByRole('button', { name: 'Закрыть' }).click(); await page.waitForURL('**/feed'); await page.goto(origin + '/feed/42'); await visible(page.getByText('Космический бургер', { exact: true })); assert.equal(await page.getByRole('dialog').count(), 0);
    await page.goto(origin + '/feed/999'); await visible(page.getByText('Заказ не найден'));
  });
  await check('personal history, cancelled status, logout, protected deep link and return after login', async () => {
    orders = [{ ...order, status: 'canceled' }]; await page.goto(origin + '/profile/orders'); await visible(page.getByText('Отменён', { exact: true })); await page.getByRole('link', { name: /Космический бургер/ }).click(); await visible(page.getByRole('dialog')); await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Выход', exact: true }).click(); await page.waitForURL('**/login');
    await page.goto(origin + '/profile/orders/42'); await page.waitForURL('**/login'); await page.getByLabel('E-mail').fill('test@example.com'); await page.getByLabel('Пароль', { exact: true }).fill('password'); await page.getByRole('button', { name: 'Войти', exact: true }).click(); await page.waitForURL('**/profile/orders/42'); await visible(page.getByText('Космический бургер', { exact: true }));
  });
  await check('empty orders render without an endless loader; unknown URL renders 404', async () => {
    orders = []; await page.goto(origin + '/profile/orders'); await visible(page.getByText('Вы ещё не сделали ни одного заказа')); await page.goto(origin + '/feed'); await visible(page.getByText('Заказов пока нет')); await page.goto(origin + '/missing'); await visible(page.getByText('Страница не найдена. Ошибка 404.'));
  });
  await check('forgot/reset guard, reset form, registration and logout', async () => {
    await page.goto(origin + '/profile'); await page.getByRole('button', { name: 'Выход', exact: true }).click(); await page.waitForURL('**/login'); await page.goto(origin + '/reset-password'); await page.waitForURL('**/forgot-password');
    await page.getByLabel('Укажите e-mail').fill('test@example.com'); await page.getByRole('button', { name: 'Восстановить', exact: true }).click(); await page.waitForURL('**/reset-password');
    await page.getByLabel('Пароль', { exact: true }).fill('new-password'); await page.getByLabel('Введите код из письма').fill('12345'); await page.getByRole('button', { name: 'Сохранить', exact: true }).click(); await page.waitForURL('**/login');
    await page.getByRole('link', { name: 'Зарегистрироваться', exact: true }).click(); await page.getByLabel('Имя', { exact: true }).fill('Тест'); await page.getByLabel('E-mail').fill('test@example.com'); await page.getByLabel('Пароль', { exact: true }).fill('password'); await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click(); await page.waitForURL(origin + '/');
  });
  await check('ingredient API error can be retried and console has no unhandled errors', async () => {
    failIngredients = true; await page.reload(); await visible(page.getByText('Ошибка ингредиентов')); failIngredients = false; await page.getByRole('button', { name: 'Повторить' }).click(); await visible(page.getByRole('link', { name: /Тестовая булка/ })); assert.deepEqual(errors, []);
  });
  await page.screenshot({ path: path.join(__dirname, '../.test-results/constructor.png'), fullPage: true });
  console.log(JSON.stringify({ passed: checks.length, checks, apiCalls: calls.length, consoleErrors: errors }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); server.close(); });
