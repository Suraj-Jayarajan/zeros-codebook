# Laravel 101

> In windows use XAMPP and create virtual host for your project. In Linux use LAMP and create virtual host for your project.

## Install composer

> Windows: https://getcomposer.org/download/

> Linux: sudo apt install composer

## Create Laravel project

```bash
laravel new .
```

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

## Models

- Located in `app/Models`

```bash
php artisan make:model Listing
```

```php
class EqCustomer extends Model  {

    use SoftDeletes;
    use CrudWithUuidObservantTrait;
    use CrudObservantTrait;

    //-------------------------------------------------
    protected $table = 'eq_customers';
    //-------------------------------------------------
    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    //-------------------------------------------------
    protected $fillable = [
        'uuid',
        'name',
        'address',
        'country',
        'webrtc_id',
        'webrtc_password',
        'is_active',
        'status',
        'meta',
        'created_by',
        'updated_by',
        'deleted_by',
    ];
     //-------------------------------------------------
    protected $casts = [
        'meta' => 'json'
    ];
    //-------------------------------------------------
    protected $appends  = [
    ];
    //-------------------------------------------------
    protected function serializeDate(\DateTimeInterface $date)
    {
        $date_time_format = config('settings.global.datetime_format');
        return $date->format($date_time_format);
    }
    //-------------------------------------------------

    //-----------------RELATIONS-----------------------
    //-------------------------------------------------
     public function roles()
    {
        return $this->hasMany(EqCustomerRole::class,
            'eq_customer_id','id'
        );
    }
    //-------------------------------------------------
    public function trainingCentres()
    {
        return $this->hasMany(EqTrainingCentre::class,
            'eq_customer_id','id'
        );
    }
    //-------------------------------------------------
    //----------------/RELATIONS-----------------------


    //-----------------COMMON--------------------------
    //-------------------------------------------------
    public function createdByUser()
    {
        return $this->belongsTo(User::class,
            'created_by', 'id'
        )->select('id', 'uuid', 'first_name', 'last_name', 'email');
    }
    //-------------------------------------------------
    public function updatedByUser()
    {
        return $this->belongsTo(User::class,
            'updated_by', 'id'
        )->select('id', 'uuid', 'first_name', 'last_name', 'email');
    }
    //-------------------------------------------------
    public function deletedByUser()
    {
        return $this->belongsTo(User::class,
            'deleted_by', 'id'
        )->select('id', 'uuid', 'first_name', 'last_name', 'email');
    }
    //-------------------------------------------------
    //----------------/COMMON--------------------------


    //----------------METHODS--------------------------
    //-------------------------------------------------
    public static function createItem($request)
    {
        // check Permissions
        if(!Auth::user()->hasPermission('hrc-can-create-customers')
            && !EqCustomerUser::hasPermission(
                \Auth::user(),'hrc-can-create-customers')){
            $response['status'] = 'failed';
            $response['errors'][] = trans("vaahcms::messages.permission_denied");
            return $response;
        }


        $inputs = $request->new_item;

        $validation = self::validation($inputs);
        if( isset($validation['status'])
            && $validation['status'] == 'failed'
        )
        {
            return $validation;
        }


        // check if name exist
        $item = self::where('name',$inputs['name'])
            ->withTrashed()
            ->first();

        if($item)
        {
            $response['status'] = 'failed';
            $response['errors'][] = "This name is already exist.";
            return $response;
        }

        $item = new self();
        $item->fill($inputs);
        //$item->slug = Str::slug($inputs['slug']);
        $item->save();


        $default_roles = HrcHelper::getCustomerDefaultRoles();

        if($default_roles)
        {
            foreach ($default_roles as $role)
            {
                $customer_role = EqCustomerRole::where('eq_customer_id', $item->id)
                    ->where('vh_role_id', $role->id)
                    ->first();

                if($customer_role)
                {
                    continue;
                }

                $customer_role = new EqCustomerRole();
                $customer_role->name = $role->name;
                $customer_role->vh_role_id = $role->id;
                $customer_role->eq_customer_id = $item->id;
                $customer_role->is_active = 1;
                $customer_role->save();

            }
        }

        Permission::syncPermissionsWithRoles();
        EqCustomerRole::recountRelations();



        $response['status'] = 'success';
        $response['data']['item'] = $item;
        $response['messages'][] = 'Saved successfully.';
        return $response;

    }
    //-------------------------------------------------
    public static function getList($request)
    {


        $list = self::orderBy('id', 'desc');

        if($request['trashed'] == 'true')
        {

            $list->withTrashed();
        }

        if(isset($request->from) && isset($request->to))
        {
            $list->betweenDates($request['from'],$request['to']);
        }

        if($request['filter'] && $request['filter'] == '1')
        {

            $list->where('is_active',$request['filter']);
        }elseif($request['filter'] == '10'){

            $list->whereNull('is_active')->orWhere('is_active',0);
        }

        if(isset($request->q))
        {

            $list->where(function ($q) use ($request){
                $q->where('name', 'LIKE', '%'.$request->q.'%');
            });
        }


        // if cannot access all customers
        if(!Auth::user()->hasPermission('hrc-can-see-all-customers')
            && !EqCustomerUser::hasPermission(
                \Auth::user(),'hrc-can-see-all-customers')){

            $customer_ids = VhUser::getRelatedCustomerIds();

            $list->whereIn('id', $customer_ids);
        }


        $data['list'] = $list->paginate(config('vaahcms.per_page'));

        $response['status'] = 'success';
        $response['data'] = $data;

        return $response;
    }
    //-------------------------------------------------


    //-------------------------------------------------
    public static function validation($inputs)
    {
        $rules = [
            'name' => 'required|max:150',
            'address' => 'required',
            'country' => 'required',
            'is_active' => 'required',
            'status' => 'required',
        ];

        $validator = \Validator::make( $inputs, $rules);
        if ( $validator->fails() ) {

            $errors             = errorsToArray($validator->errors());
            $response['status'] = 'failed';
            $response['errors'] = $errors;
            return $response;
        }

    }
    //-------------------------------------------------


    //-------------------------------------------------
    //----------------/METHODS-------------------------
}
```

## Controllers

- Located in `app/Http/Controllers`

```bash
php artisan make:controller ListingController
```

```php
class CustomersController extends Controller
{

    //----------------------------------------------------------
    public function __construct()
    {

    }
    //----------------------------------------------------------
    public function getAssets(Request $request)
    {

        $global_distance_settings = [
            'walk_upper_limit' => env('WALK_UPPER_LIMIT'),
            'trot_upper_limit' => env('TROT_UPPER_LIMIT'),
            'canter_upper_limit' => env('CANTER_UPPER_LIMIT'),
        ];

        // set data
        $data = [];
        $data['bulk_actions'] = vh_general_bulk_actions();
        $data['countries'] = $this->getTaxonomyByTypeList('countries');
        $data['permission'] = [];
        $data['global_distance_settings'] =  $global_distance_settings;

        $response['status'] = 'success';
        $response['data'] = $data;

        return response()->json($response);
    }
    //----------------------------------------------------------
    public function postCreate(Request $request)
    {
        $response = EqCustomer::createItem($request);
        return response()->json($response);
    }
    //----------------------------------------------------------
    public function getList(Request $request)
    {
        $response = EqCustomer::getList($request);
        return response()->json($response);
    }
    //----------------------------------------------------------
    public function getItem(Request $request, $id)
    {
        $response = EqCustomer::getItem($id);
        return response()->json($response);
    }

    //----------------------------------------------------------
    public function postStore(Request $request,$id)
    {
        $response = EqCustomer::postStore($request,$id);
        return response()->json($response);
    }
    //----------------------------------------------------------
}
```

## Routes

> Open `routes` folder

1. `web.php` - for web routes
2. `api.php` - for api routes
3. `console.php` - for console commands

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

### For View Routes

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

#### Passing data to views

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

## Migrations

- Located in `database/migrations`

```bash
php artisan make:migration create_users_table
```

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EqCustomers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        Schema::create('eq_customers', function (Blueprint $table) {
            $table->increments('id');
            $table->uuid('uuid')->nullable()->index();

            $table->string('name')->nullable()->index();
            $table->string('address')->nullable();
            $table->string('country')->nullable();
            $table->integer('count_users')->nullable();
            $table->boolean('is_active')->nullable()->index();
            $table->string('status')->nullable()->index();

            //----common fields
            $table->text('meta')->nullable();
            $table->integer('created_by')->nullable()->index();
            $table->integer('updated_by')->nullable()->index();
            $table->integer('deleted_by')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['created_at', 'updated_at', 'deleted_at']);
            //----/common fields

        });
    }

    /**
    * Reverse the migrations.
    *
    * @return void
    */
    public function down()
    {
        Schema::dropIfExists('eq_customers');
    }
}

```

## Eloquent Relationships

### 1.One-to-One

```php
return $this->hasOne(Profile::class);
```

### 2.One-to-Many

```php
return $this->hasMany(Post::class);
```

#### Inverse of One-to-One and One-to-Many

```php
return $this->belongsTo(User::class);
```

### 3.Many-to-Many

```php
return $this->belongsToMany(Role::class);
```

### 4.Has One Through

```php
return $this->hasOneThrough(Owner::class, Car::class);
```

### 5.Has Many Through

```php
return $this->hasManyThrough(Post::class, User::class);
```

### 6.Polymorphic Relationships

- Polymorphic One-to-One
- Polymorphic One-to-Many
- Polymorphic One-of-Many
- Polymorphic Many-to-Many
- Polymorphic Many-By-Many (Inverse Many-to-Many)
- Custom Polymorphic Types

```php
return $this->morphOne(Photo::class, 'imageable');
```

### 7.Polymorphic One-to-Many

```php
return $this->morphMany(Comment::class, 'commentable');
```

👉 Interview Insight:

Uses foreign keys + conventions
Pivot table required for many-to-many

## Request Lifecycle

A Laravel request enters through index.php, gets handled by the HTTP kernel, passes through middleware, is routed to a controller, and the response is returned back through the middleware and sent to the client

```
Client (Browser / API Request)
        ↓
public/index.php  (Entry Point)
        ↓
Autoload + Bootstrap App
(vendor/autoload.php + bootstrap/app.php)
        ↓
Create Application Instance (Service Container)
        ↓
HTTP Kernel (app/Http/Kernel.php)
        ↓
Global Middleware (pre-processing)
        ↓
Service Providers Bootstrapping
(register → boot)
        ↓
Router (routes/web.php or api.php)
        ↓
Route Middleware
        ↓
Controller / Closure Execution
        ↓
Response Generated
        ↓
Route Middleware (post-processing)
        ↓
HTTP Kernel returns Response
        ↓
Response sent to Browser
```

![Request Lifecycle](/laravel-request-lifecycle.png)

## Service Providers

- Located in `app/Providers`

Service Providers are used to:

- Register services into the container
- Configure application components

Example:

```php
<?php namespace VaahCms\Modules\HRC\Providers;


use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Factory;
use VaahCms\Modules\HRC\Http\Middleware\HasHRCModuleAccess;
use VaahCms\Modules\HRC\Providers\RouteServiceProvider;
use VaahCms\Modules\HRC\Providers\EventServiceProvider;

class HRCServiceProvider extends ServiceProvider
{
    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = false;

    /**
     * Boot the application events.
     *
     * @return void
     */
    public function boot(Router $router)
    {

        $this->registerMiddleware($router);
        $this->registerTranslations();
        $this->registerConfig();
        $this->registerViews();
        $this->registerAssets();
        //$this->registerFactories();
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        $this->registerSeeders();
        $this->registerBladeDirectives();
        $this->registerBladeComponents();
    }


    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {

        $this->app->register(RouteServiceProvider::class);
        $this->app->register(EventServiceProvider::class);
        $loader = \Illuminate\Foundation\AliasLoader::getInstance();

        $this->registerHelpers();
        $this->registerLibraries();

    }

    /**
     *
     */
    private function registerMiddleware($router) {

        //register middleware
        $router->aliasMiddleware('has.hrc.module.access', HasHRCModuleAccess::class);

    }

    /**
     *
     */
    private function registerHelpers() {

        //load all the helpers
        foreach (glob(__DIR__.'/../Helpers/*.php') as $filename){
            require_once($filename);
        }

    }

    /**
     *
     */
    private function registerLibraries()
    {
        //load all the helpers
        foreach (glob(__DIR__.'/Libraries/*.php') as $filename){
            require_once($filename);
        }
    }


    /**
     *
     */
    private function registerSeeders() {

        //load all the seeds
        foreach (glob(__DIR__.'/../Database/Seeds/*.php') as $filename){
            require_once($filename);
        }

    }

    /**
     * Register config.
     *
     * @return void
     */
    protected function registerConfig()
    {
        $this->publishes([
            __DIR__.'/../Config/config.php' => config_path('hrc.php'),
        ], 'config');
        $this->mergeConfigFrom(
            __DIR__.'/../Config/config.php', 'hrc'
        );
    }

    /**
     * Register views.
     *
     * @return void
     */
    public function registerViews()
    {
        $viewPath = resource_path('/views/vaahcms/modules/hrc');

        $sourcePath = __DIR__.'/../Resources/views';

        $this->publishes([
            $sourcePath => $viewPath
        ],'views');

        $this->loadViewsFrom(array_merge(array_map(function ($path) {
            return $path . '/views/vaahcms/modules/hrc';
        }, \Config::get('view.paths')), [$sourcePath]), 'hrc');

    }

    /**
     * Register views.
     *
     * @return void
     */
    public function registerAssets()
    {

        $sourcePath = __DIR__.'/../Resources/assets';

        $desPath = public_path('vaahcms/modules/hrc/assets');

        $this->publishes([
            $sourcePath => $desPath
        ],'assets');


    }


    /**
     * Register translations.
     *
     * @return void
     */
    public function registerTranslations()
    {
        $langPath = resource_path('/lang/vaahcms/modules/hrc');

        if (is_dir($langPath)) {
            $this->loadTranslationsFrom($langPath, 'hrc');
        } else {
            $this->loadTranslationsFrom(__DIR__ .'/../Resources/lang', 'hrc');
        }
    }

    /**
     * Register an additional directory of factories.
     *
     * @return void
     */
    public function registerFactories()
    {
        if (! app()->environment('production')) {
            app(Factory::class)->load(__DIR__ . '/../Database/factories');
        }
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [];
    }


    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function registerBladeDirectives()
    {

        /*
        \Blade::directive('hello', function ($expression) {
            return "<?php echo 'Hello ' . {$expression}; ?>";
        });
        */

    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function registerBladeComponents()
    {

        /*
        \Blade::component('example', Example::class);
        */

    }

}
```

> **NOTE:** Service Containers are a bit adavanced Dependency Injection in laravel.
>
> ```php
> class UserController extends Controller
> {
>    protected $service;
>
>    public function __construct(UserService $service)
>    {
>        $this->service = $service;
>    }
> }
> ```

## Elequent ORM

Eloquent is Laravel’s Active Record ORM, where:

- Each `Model` ↔ `Table`
- Each `Object` ↔ `Row`
- Each `Property` ↔ `Column`

### Core Concepts

#### Model Basics

```php
class User extends Model
{
    protected $table = 'users'; // optional
    protected $fillable = ['name', 'email'];
    protected $hidden = ['password'];
}
```

#### Mass Assignment

```
User::create([
    'name' => 'Suraj',
    'email' => 'suraj@example.com'
]);
```

> Requires `$fillable` or `$guarded`

### Modern Laravel (PHP Attributes)

```php
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


#[Table('my_flights', key: 'flight_id')]
#[Fillable(['name', 'email', 'options->enabled'])] // `options` is a JSON column
class Flight extends Model
{
    use HasUuids;
}
```

> Requires PHP 8.0+ and Laravel 10.0+

> Other Attrubutes:
>
> - `#[Guarded]`
> - `#[Hidden]`
> - `#[Casts]`
> - `#[Appends]`
> - `#[WithoutTimestamps]`
> - `#[DateFormat('U')]`

## Query Builder

Laravel Query Builder provides a fluent, SQL-like interface to interact with the database without using Eloquent models.

### Get All

```php
$flights = Flight::all();
```

### Get Limited

```php
$flights = Flight::where('active', 1)
    ->orderBy('name')
    ->limit(10)
    ->get();
```

### Select

```php
DB::table('users')->select('id', 'name')->get();
DB::table('users')->selectRaw('COUNT(*) as count')->get();
DB::table('users')->distinct()->get();
```

### Where Clauses

#### Basic

```php
->where('id', 1)
->where('status', '=', 'active')
```

#### Multiple

```php
->where([
    ['status', '=', 'active'],
    ['age', '>', 18],
])
```

#### OR

```php
->orWhere('status', 'inactive')
```

#### Advanced

```php
->whereBetween('age', [18, 30])
->whereNotBetween('age', [18, 30])

->whereIn('id', [1,2,3])
->whereNotIn('id', [1,2])

->whereNull('deleted_at')
->whereNotNull('email')

->whereDate('created_at', '2024-01-01')
->whereMonth('created_at', 1)
->whereYear('created_at', 2024)
->whereTime('created_at', '12:00:00')

->whereColumn('updated_at', '>', 'created_at')

->whereExists(function ($q) {
    $q->select(DB::raw(1))
      ->from('orders')
      ->whereColumn('orders.user_id', 'users.id');
})
```

### Joins

```php
->join('posts', 'users.id', '=', 'posts.user_id')
->leftJoin('posts', 'users.id', '=', 'posts.user_id')
->rightJoin('posts', 'users.id', '=', 'posts.user_id')
->crossJoin('roles')
```

#### Join with conditions

```php
->join('posts', function ($join) {
    $join->on('users.id', '=', 'posts.user_id')
         ->where('posts.active', 1);
});
```

### Ordering & Grouping

```php
->orderBy('name', 'asc')
->orderByDesc('created_at')

->groupBy('status')
->having('count', '>', 10)
->havingRaw('COUNT(*) > 10')
```

### Limit & Offset

```php
->limit(10)
->offset(20)

// shortcut
->skip(20)->take(10)
```

### Aggregates

```php
->count()
->max('price')
->min('price')
->avg('price')
->sum('price')
```

### Insert

```php
DB::table('users')->insert([
    'name' => 'Suraj',
    'email' => 'test@example.com'
]);
```

#### Insert Multiple

```php
->insert([
    ['name' => 'A'],
    ['name' => 'B']
]);
```

#### Insert & Get ID

```php
->insertGetId([...]);
```

### Update

```php
->where('id', 1)->update([
    'name' => 'Updated'
]);
```

### Increment / Decrement

```php
->increment('votes')
->increment('votes', 5)

->decrement('votes')
```

### Delete

```php
->delete()
->where('id', 1)->delete()
```

### Upserts

```php
DB::table('users')->upsert(
    [
        ['email' => 'a@test.com', 'name' => 'A'],
    ],
    ['email'], // unique key
    ['name']   // fields to update
);
```

### Advanced Query Methods

#### Raw Expressions

```php
DB::raw('COUNT(*) as count')

->selectRaw('price * ? as price_with_tax', [1.2])
->whereRaw('price > IF(state = "TX", ?, 100)', [200])
->orderByRaw('updated_at - created_at DESC')
```

#### Subqueries

```php
->selectSub(function ($q) {
    $q->select('name')
      ->from('roles')
      ->whereColumn('roles.id', 'users.role_id')
      ->limit(1);
}, 'role_name')
```

#### Conditional Queries

```php
->when($active, fn($q) => $q->where('active', 1))
```

#### Chunking

```php
DB::table('users')->chunk(100, function ($users) {
    //
});
```

#### Cursor (Memory Efficient)

```php
foreach (DB::table('users')->cursor() as $user) {
    //
}
```

#### Lazy Collections

```php
DB::table('users')->lazy();
```

### Retrieval Methods

```php
->get()        // Collection
->first()      // Single row
->firstOrFail()
->value('name') // single column
->pluck('name') // array/collection
->exists()
->doesntExist()
```

### Transactions

```php
DB::transaction(function () {
    DB::table('users')->update([...]);
});
```

### Debugging

```php
->toSql()
->dump()
->dd()
```

### Performance Tips

- Use `select()` instead of `*`
- Use indexes on filtered columns
- Use `chunk()` for large datasets
- Prefer Query Builder for **heavy queries**


## Laravel Collections
A Collection is a fluent, chainable wrapper over arrays.

- Returned by:
    - Eloquent → Model::get()
    - Query Builder → DB::table()->get()
    - Custom → collect([...])
- Supports functional programming (map, filter, reduce)

### Creating Collections

```php
collect([1, 2, 3]);

Collection::make([1, 2, 3]);

collect(range(1, 10));
```

### Common Methods

```php