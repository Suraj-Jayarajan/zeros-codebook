# Laravel 101

## Introduction

- PHP framework following MVC (Model-View-Controller)
- Built by Taylor Otwell
- Focus:
  - Developer experience (DX)
  - Clean syntax (Expressive API)
  - Rapid development

## Project Structure

```
project-root/
│
├── app/
│   ├── Console/              # Artisan commands
│   ├── Events/               # Events
│   ├── Exceptions/           # Exception handling
│   ├── Http/
│   │   ├── Controllers/      # Controllers
│   │   ├── Middleware/       # Middleware
│   │   ├── Requests/         # Form Requests (validation)
│   │
│   ├── Jobs/                 # Queue Jobs
│   ├── Listeners/            # Event listeners
│   ├── Mail/                 # Email classes
│   ├── Models/               # Eloquent models
│   ├── Notifications/        # Notifications (mail, SMS, etc.)
│   ├── Policies/             # Authorization logic
│   ├── Providers/            # Service providers
│   └── Rules/                # Custom validation rules
│
├── bootstrap/
│   └── app.php               # Bootstrapping
│
├── config/                   # Config files
│
├── database/
│   ├── factories/            # Model factories
│   ├── migrations/           # DB schema
│   └── seeders/              # Seed data
│
├── public/                   # Entry point (index.php)
│
├── resources/
│   ├── css/
│   ├── js/
│   ├── views/                # Blade templates
│
├── routes/
│   ├── web.php               # Web routes
│   ├── api.php               # API routes
│   ├── console.php           # CLI routes
│   └── channels.php          # Broadcasting
│
├── storage/
│   ├── app/
│   ├── framework/
│   └── logs/
│
├── tests/
│   ├── Feature/
│   └── Unit/
│
├── vendor/                   # Composer dependencies
│
├── .env
├── artisan
├── composer.json
└── vite.config.js
```

## Routes

- Defined in `routes/web.php` (for web) and `routes/api.php` (for API)

### Style 1: Closure-based routes

```php
Route::get('/users/{id}', fn($id) => $id);
```

### Style 2: Controller-based routes

```php
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
```

### Style 3: Controller method as string

```php
 Route::post( '/assets', 'BackendController@getAssets' )
            ->name( 'vh.backend.hrc.assets' );
```

### Style 4: Route groups with middleware (Preffered)

```php
Route::group(
[
    'prefix' => 'backend/hrc/customers',

    'middleware' => ['web', 'has.hrc.module.access'],

    'namespace' => 'Backend',
],
function () {
     //---------------------------------------------------------
     Route::get('/', 'CustomersController@getIndex')
    ->name('vh.backend.hrc.customers.home');
     //---------------------------------------------------------
     Route::any('/assets', 'CustomersController@getAssets')
    ->name('vh.backend.hrc.customers.assets');
     //---------------------------------------------------------
     Route::post('/create', 'CustomersController@postCreate')
    ->name('vh.backend.hrc.customers.create');
     //---------------------------------------------------------
     Route::any('/list', 'CustomersController@getList')
    ->name('vh.backend.hrc.customers.list');
     //---------------------------------------------------------
     Route::any('/item/{uuid}', 'CustomersController@getItem')
    ->name('vh.backend.hrc.customers.item');
     //---------------------------------------------------------
     Route::post('/store/{uuid}', 'CustomersController@postStore')
    ->name('vh.backend.hrc.customers.store');
     //---------------------------------------------------------
     Route::post('/actions/{action_name}', 'CustomersController@postActions')
    ->name('vh.backend.hrc.customers.actions');
     //---------------------------------------------------------
     Route::any('/search', 'CustomersController@searchCustomers')
        ->name('vh.backend.hrc.customers.search');
     //---------------------------------------------------------
});
```
