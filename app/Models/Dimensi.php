<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama_dimensi', 'keterangan'])]
class Dimensi extends Model
{
    protected $table = 'dimensi';
}
