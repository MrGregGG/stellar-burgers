# Загрузка в GitHub

Выполнение подготовлено локально в ветке `review`. Удалённый репозиторий не указан; push и Pull Request не выполнялись. Ветка `main` сохранена как исходная заготовка, merge не выполнялся.

В архиве рядом с исходниками находится `git-history/stellar-burgers-review.bundle` — история двух веток без каталога `.git`.

## Новый пустой репозиторий

Создайте пустой репозиторий на GitHub без README, лицензии и `.gitignore`. Откройте PowerShell в папке, в которую распакован архив (рядом с папками `stellar-burgers` и `git-history`).

Замените `YOUR_NAME/YOUR_REPOSITORY` на свой адрес:

```powershell
git clone -b review .\git-history\stellar-burgers-review.bundle .\stellar-burgers-git
Set-Location .\stellar-burgers-git
git branch main origin/main
git remote set-url origin https://github.com/YOUR_NAME/YOUR_REPOSITORY.git
git push -u origin main
git push -u origin review
```

Здесь `main` — только исходная заготовка. Реализация находится в `review`.

В GitHub откройте Pull requests → New pull request. Выберите **base: main**, **compare: review**. Название: `Stellar Burger: роутинг, авторизация и заказы`. Текст описания находится в `docs/pull-request.md`. Создайте PR, не нажимая Merge.

Если установлен и авторизован GitHub CLI, PR можно создать из папки репозитория:

```powershell
gh pr create --base main --head review --title "Stellar Burger: роутинг, авторизация и заказы" --body-file docs/pull-request.md
```

## Уже есть репозиторий с заготовкой

Используйте его существующую историю. Не отправляйте в него `main` из bundle и не используйте force push.

1. Клонируйте свой репозиторий в отдельную папку рядом с распакованной `stellar-burgers`.
2. В клоне создайте ветку:

```powershell
git switch main
git switch -c review
```

Если `review` уже существует, используйте `git switch review`.

3. Скопируйте содержимое папки `stellar-burgers` в клон с заменой файлов, включая `.gitignore`, `.eslintrc`, `.env.example` и `.storybook`. Не копируйте `node_modules`, `dist`, `.env` и `.git`.
4. Проверьте и отправьте:

```powershell
npm install
npm run typecheck
npm run lint
npm test
npm run build
git status
git add .
git commit -m "feat: implement routing, authentication and orders"
git push -u origin review
```

5. Создайте Pull Request `review` → `main` как описано выше. Файл `.gitignore` обязательно должен присутствовать, чтобы зависимости и локальная конфигурация не попали в коммит.
