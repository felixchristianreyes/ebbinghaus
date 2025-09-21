<?php

namespace App\Providers;

use App\Models\Card;
use App\Observers\CardObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Card::observe(CardObserver::class);
    }
}
