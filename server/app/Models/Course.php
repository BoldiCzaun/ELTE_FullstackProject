<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'max_student',
        'user_id'
    ];

    public function students(): BelongsToMany {
        return $this->belongsToMany(User::class);
    }

    public function teacher(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function requirements(): HasMany {
        return $this->hasMany(Requirement::class);
    }
}
