<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CourseUser extends Pivot
{
    protected $fillable = [
        'created_at',
        'updated_at'
    ];
}
