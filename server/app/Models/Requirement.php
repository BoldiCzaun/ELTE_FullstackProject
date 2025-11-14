<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Requirement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'begin',
        'repeat_count',
        'repeat_skip',
        'total_score_weight',
        'course_id'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'begin' => 'datetime',
        ];
    }

    public function course() : BelongsTo {
        return $this->belongsTo(Course::class);
    }

    public function scores(): HasMany {
        return $this->hasMany(Score::class);
    }
}
