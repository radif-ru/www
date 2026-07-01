# radif.ru — персональный сайт и резюме

Исходный код персонального сайта-резюме [radif.ru](https://radif.ru).
Главная страница (`index.html`) — самодостаточное резюме (встроенные CSS и JS),
разворачивается в Docker за nginx (см. `Dockerfile`, `docker-compose.prod.yml`, `etc/nginx`).

## Связанный репозиторий

Этот репозиторий используется вместе с
[radif-ru/linux_settings](https://github.com/radif-ru/linux_settings) —
там хранятся настройки рабочего окружения Linux. Каталог `www` в `linux_settings`
соответствует содержимому данного репозитория (`radif-ru/www`).

## Структура

- `index.html` — главная страница-резюме.
- `files/` — файлы сайта (изображения, документы).
- `etc/nginx/` — конфигурация nginx для продакшена.
- `Dockerfile`, `docker-compose.prod.yml` — сборка и деплой.
- Подмодули — отдельные учебные и pet-проекты (см. ниже).

## Git-подмодули

Учебные и демонстрационные проекты подключены как git-подмодули (см. `.gitmodules`).
Каждый подмодуль — самостоятельный репозиторий, а в этом репозитории фиксируется
лишь ссылка на конкретный коммит.

| Подмодуль | Краткое описание |
| --- | --- |
| [Django_optimization_tools](https://github.com/radif-ru/Django_optimization_tools) | Инструменты и практики оптимизации Django: кэширование, профилирование, оптимизация запросов. |
| [Full_Stack_Django_REST_React](https://github.com/radif-ru/Full_Stack_Django_REST_React) | Fullstack-приложение: backend на Django REST Framework + frontend на React, контейнеризация Docker. |
| [HTML-CSS-Base](https://github.com/radif-ru/HTML-CSS-Base) | Базовая вёрстка HTML/CSS (лендинг и каталог). |
| [HTML-CSS-Prof](https://github.com/radif-ru/HTML-CSS-Prof) | Профессиональная вёрстка HTML/CSS, несколько макетов. |
| [Intergalactic_Entertainment](https://github.com/radif-ru/Intergalactic_Entertainment) | Проект на Django с авторизацией и вёрсткой страниц. |
| [JavaScriptProfessional](https://github.com/radif-ru/JavaScriptProfessional) | Продвинутый JavaScript: сборка через Gulp/Bower, интерактивный интерфейс. |
| [JavaScriptProfessional-v2](https://github.com/radif-ru/JavaScriptProfessional-v2) | Вторая версия проекта JavaScript Professional. |
| [html-css_interactive](https://github.com/radif-ru/html-css_interactive) | Интерактивная вёрстка HTML/CSS на основе Bootstrap. |

### Клонирование вместе с подмодулями

```bash
git clone --recurse-submodules https://github.com/radif-ru/www.git
```

Если репозиторий уже склонирован:

```bash
git submodule update --init --recursive
```

### Обновление подмодулей до последних коммитов

```bash
git submodule update --remote --merge
```
