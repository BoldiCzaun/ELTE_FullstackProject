<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot {
    protected $fillable = [
        'created_at',
        'updated_at'
    ];
}