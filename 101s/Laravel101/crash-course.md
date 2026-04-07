## Get Laravel
> In windows use XAMPP and create virtual host for your project. In Linux use LAMP and create virtual host for your project.

## Install composer
> Windows: https://getcomposer.org/download/

> Linux: sudo apt install composer

## Create Laravel project
```bash
laravel new .
```

## Routes
> Open `routes` folder

1. `web.php` - for web routes
2. `api.php` - for api routes
3. `console.php` - for console commands

```php
Route::get('/', function () {
    return view('welcome');
});
```

```php
Route::get('/hello', function () {
    return 'Hello World';
});
```

```php
Route::get('/user/{id}', function ($id) {
    return response('<h1>Hello World</h1>')
        ->header('Content-Type', 'text/html')
        ->header('X-Custom-Header', 'Custom Value');
})->where('id', '[0-9]+')
->name('user.show');
```

### Passing data to views
```php
Route::get('/', function () {
    return view('listings', [
        'heading' => 'Latest Listings',
        'listings' => [
            ['id' => 1, 'title' => 'Listing One'],
            ['id' => 2, 'title' => 'Listing Two'],
            ['id' => 3, 'title' => 'Listing Three'],
        ]
    ]);
});
```

#### views/listings.blade.php
```php
<h1>{{ $heading }}</h1>
<ul>
    @foreach ($listings as $listing)
        <li>{{ $listing['title'] }}</li>
    @endforeach
</ul>
```

## Blade View
> located in `resources/views` folder

> Blade is a simple, yet powerful templating engine provided with Laravel. It allows you to use plain PHP code in your views, and also provides some convenient shortcuts for common tasks.

### for loop
```php
@for ($i = 0; $i < 10; $i++)
    <p>{{ $i }}</p>
@endfor

@foreach ($listings as $listing)
    <p>{{ $listing['title'] }}</p>
@endforeach

@while (true)
    <p>Infinite Loop</p>
@endwhile

### if statement
```php
@if ($listing['id'] === 1)
    <p>Listing One</p>
@elseif ($listing['id'] === 2)
    <p>Listing Two</p>
@else
    <p>Other Listing</p>
@endif
```
### unless statement
```php
@unless (count($listings) === 0)
    <p>Not Listing One</p>
@endunless
```


## Models
> located in `app/Models` folder

```bash
php artisan make:model Listing
```

```php
<?php
namespace App\Models;

class Listing extends Model
{
    protected $fillable = ['title', 'description'];

    public static function getAll()
    {
        return self::all();
    }
}
```