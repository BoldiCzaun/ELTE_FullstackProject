<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\Role as EnumsRole;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role(): HasOneThrough {
        return $this->hasOneThrough(
            Role::class,
            RoleUser::class,
            'user_id',
            'id',
            'id',
            'role_id'
        );
    }

    public function isAdmin(): bool {
        return $this->role->role == EnumsRole::Admin;
    }

    public function teacher_courses() : HasMany {
        return $this->hasMany(Course::class);
    }

    public function student_courses() : BelongsToMany {
        return $this->belongsToMany(Course::class);
    }

    public function scores(): HasMany {
        return $this->hasMany(Score::class);
    }
}
