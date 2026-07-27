<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama_kategori', 'keterangan'])]
class Kategori extends Model
{
    protected $table = 'kategori';
}
