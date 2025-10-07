<?php

namespace App\Models;

use App\Enums\Role as EnumsRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use RuntimeException;

class Role extends Model
{
    //
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => EnumsRole::class,
        ];
    }

    public function student(): bool {
        return $this['role'] == EnumsRole::Student;
    }

    public function teacher(): bool {
        return $this['role'] == EnumsRole::Teacher;
    }

    public function admin(): bool {
        return $this['role'] == EnumsRole::Admin;
    }

    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class);
    }
}
