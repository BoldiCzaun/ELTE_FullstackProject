<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Score extends Model
{
    use HasFactory;

    protected $fillable = [
        'score',
        'requirement_num',
        'user_id'
    ];

    protected $appends = ['user_name'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function getUserNameAttribute() {
        return $this->user ? $this->user->name : null;
    }
}
