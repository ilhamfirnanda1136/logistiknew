<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama_satuan', 'keterangan'])]
class Satuan extends Model
{
    protected $table = 'satuan';
}
