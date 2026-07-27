# Dokumentasi Alur Kode — Controller → Service → Repository

> Untuk keperluan presentasi interview.  
> Stack: **Laravel 13 · Vue 3 (TypeScript) · Inertia.js · PostgreSQL**

---

## 1. Gambaran Arsitektur

```
HTTP Request
    │
    ▼
┌─────────────────────┐
│   Middleware Stack  │  auth, role:Administrator, dll.
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Form Request      │  Validasi input (Rules, authorize)
│   (RoleRequest dll) │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│    Controller       │  Tipis — hanya terima request, panggil service,
│  (thin layer)       │  kembalikan Inertia response / redirect
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│     Service         │  Business logic: snapshot, filter, hash password,
│  (business logic)   │  validasi bisnis, upload file
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│    Repository       │  Abstraksi akses database (interface → implementasi)
│  (data access)      │  Hanya: query, create, update, delete, findOrFail
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Eloquent Model     │  Auditable, SoftDeletes, HasUuids, casts, relations
└─────────────────────┘
    │
    ▼
  PostgreSQL
```

---

## 2. Dependency Injection — RepositoryServiceProvider

File: `app/Providers/RepositoryServiceProvider.php`

```
bootstrap/providers.php
  └── RepositoryServiceProvider::register()
        │
        ├── RoleRepositoryInterface::class  → RoleRepository::class
        ├── UserRepositoryInterface::class  → UserRepository::class
        ├── ProjectRepositoryInterface::class → ProjectRepository::class
        ├── TaskRepositoryInterface::class  → TaskRepository::class
        └── DocumentRepositoryInterface::class → DocumentRepository::class
```

**Cara kerjanya:** Saat Laravel membuat instance `RoleService`, IoC Container otomatis
meng-inject `RoleRepository` ke parameter `RoleRepositoryInterface`-nya.
Controller tidak tahu apakah data dari Eloquent, cache, atau mock — hanya
tahu contract (interface).

---

## 3. Base Layer yang Dipakai Semua Service

### `AppliesQueryFilters` (trait)
File: `app/Services/Concerns/AppliesQueryFilters.php`

| Method | Tugas |
|---|---|
| `applySearch($query, $term, $columns)` | WHERE LOWER(col) LIKE '%term%' di beberapa kolom |
| `applySort($query, $sort, $dir, $allowed)` | ORDER BY kolom yang ada di allow-list |

### `BaseRepository` (abstract)
File: `app/Repositories/Eloquent/BaseRepository.php`

| Method | SQL |
|---|---|
| `query()` | `newQuery()` — Builder bersih |
| `findOrFail($id)` | SELECT … WHERE id = ? |
| `create($attrs)` | INSERT |
| `update($id, $attrs)` | UPDATE + refresh model |
| `delete($id)` | Soft DELETE (SoftDeletes) |

### `Controller::toastBack()`
File: `app/Http/Controllers/Controller.php`

```php
Inertia::flash('toast', ['type' => 'success', 'message' => '...']);
return back();
```
Semua controller turunan pakai helper ini untuk flash notifikasi ke Vue
setelah operasi write berhasil.

---

## 4. RoleController → RoleService

File controller: `app/Http/Controllers/RoleController.php`  
File service: `app/Services/RoleService.php`

### 4.1 Alur `index` (tampilkan daftar)

```
GET /roles?search=admin&sort=name&direction=asc&per_page=10
    │
    ▼ RoleController::index(Request $request)
    │   $filters = $request->only(['search','sort','direction','per_page'])
    │
    ▼ RoleService::paginate($filters)
    │   ├── $query = RoleRepository::query()->withCount('users')
    │   ├── AppliesQueryFilters::applySearch($query, 'admin', ['name','description'])
    │   │     └── WHERE LOWER(name) LIKE '%admin%' OR LOWER(description) LIKE '%admin%'
    │   ├── AppliesQueryFilters::applySort($query, 'name', 'asc', [...])
    │   │     └── ORDER BY name ASC
    │   └── ->paginate(10)->withQueryString()
    │         └── RETURN LengthAwarePaginator
    │
    ▼ Inertia::render('roles/Index', [
         'roles'           => <paginator>,
         'filters'         => $filters,
         'permissionOptions' => config('permissions.list'),
         'exportColumns'   => config('transfers.entities.roles.columns'),
       ])
    │
    ▼ Vue: roles/Index.vue menerima props dan merender tabel
```

### 4.2 Alur `store` (buat role baru)

```
POST /roles  {name, description, permissions[], is_active}
    │
    ▼ RoleRequest::rules() — validasi
    │   name: required|string|unique:roles
    │   permissions: array of string
    │   is_active: boolean
    │
    ▼ RoleController::store(RoleRequest $request)
    │   $this->service->create($request->validated())
    │
    ▼ RoleService::create($data)
    │   ├── prepare($data):
    │   │     jika is_active = true  → set activated_at = now()
    │   │     jika is_active = false → set activated_at = null
    │   └── RoleRepository::create($data)
    │         └── Role::create([...])  ← INSERT roles + audit log otomatis
    │
    ▼ toastBack('Role created successfully.')
```

### 4.3 Alur `update` (edit role)

```
PUT /roles/{role}  {name, description, permissions[], is_active}
    │
    ▼ RoleRequest::rules() — validasi (unique ignore ID saat ini)
    │
    ▼ RoleController::update(RoleRequest $request, Role $role)
    │   $this->service->update($role->id, $request->validated())
    │
    ▼ RoleService::update($id, $data)
    │   ├── prepare($data) — sama seperti store
    │   └── RoleRepository::update($id, $data)
    │         ├── findOrFail($id)       ← SELECT
    │         ├── $model->update([...]) ← UPDATE + audit log (old_values, new_values)
    │         └── return $model->refresh()
    │
    ▼ toastBack('Role updated successfully.')
```

### 4.4 Alur `destroy` (hapus role)

```
DELETE /roles/{role}
    │
    ▼ RoleController::destroy(Role $role)
    │   $this->service->delete($role->id)
    │
    ▼ RoleService::delete($id)
    │   └── RoleRepository::delete($id)
    │         ├── findOrFail($id)
    │         └── $model->delete()  ← Soft delete: set deleted_at = now()
    │
    ▼ toastBack('Role deleted successfully.')
```

---

## 5. UserController → UserService

File controller: `app/Http/Controllers/UserController.php`  
File service: `app/Services/UserService.php`  
**Middleware:** `role:Administrator` (hanya Administrator yang bisa akses)

### 5.1 Alur `index`

```
GET /users?search=budi&role_id=<uuid>
    │
    ▼ UserController::index()
    │   $filters = ['search','sort','direction','per_page','role_id']
    │   + RoleService::options() → dropdown roles untuk filter
    │
    ▼ UserService::paginate($filters)
    │   ├── $query = UserRepository::query()->with('roles')
    │   ├── applySearch(['name','email'])
    │   ├── jika role_id ada: whereHas('roles', fn → WHERE roles.id = ?)
    │   ├── applySort(['name','email','created_at'])
    │   └── paginate(10)
    │
    ▼ Inertia::render('users/Index', [...])
```

### 5.2 Alur `store`

```
POST /users  {name, email, password, password_confirmation, roles[]}
    │
    ▼ UserRequest::rules()
    │   email: required|email|unique:users
    │   password: required|confirmed|min:8
    │   roles: array of existing role IDs
    │
    ▼ UserController::store()
    │
    ▼ UserService::create($data)
    │   ├── pisahkan $roleIds dari $data
    │   ├── Hash::make($data['password'])  ← bcrypt password
    │   ├── UserRepository::create($data)  ← INSERT users
    │   └── $user->roles()->sync($roleIds) ← UPSERT role_user pivot
    │         (composite PK: role_id + user_id)
    │
    ▼ toastBack('User created successfully.')
```

### 5.3 Alur `update`

```
PUT /users/{user}
    │
    ▼ UserService::update($id, $data)
    │   ├── pisahkan $roleIds
    │   ├── jika password diisi → Hash::make; jika kosong → unset (tidak ganti)
    │   ├── UserRepository::update($id, $data)  ← UPDATE
    │   └── jika $roleIds array → $user->roles()->sync($roleIds)
```

---

## 6. ProjectController → ProjectService

File controller: `app/Http/Controllers/ProjectController.php`  
File service: `app/Services/ProjectService.php`

### 6.1 Alur `index`

```
GET /projects?search=x&status=active&is_active=1
    │
    ▼ ProjectService::paginate($filters)
    │   ├── $query = ProjectRepository::query()->withCount('tasks')
    │   ├── applySearch(['code','name','description'])
    │   ├── jika status ada: WHERE status = ?
    │   ├── jika is_active ada: WHERE is_active = true/false
    │   └── applySort(['code','name','status','started_at','created_at'])
    │
    ▼ Inertia::render('projects/Index', [...])
```

### 6.2 Alur `store` / `update` / `destroy`

```
store:
  ProjectController → ProjectService::create($data)
    └── ProjectRepository::create($data) ← INSERT

update:
  ProjectController → ProjectService::update($id, $data)
    └── ProjectRepository::update($id, $data) ← UPDATE + audit log

destroy:
  ProjectController → ProjectService::delete($id)
    └── ProjectRepository::delete($id) ← Soft delete
```

> **Catatan:** Setiap perubahan Project direkam oleh `owen-it/laravel-auditing`
> secara otomatis karena model menggunakan trait `Auditable`.

---

## 7. TaskController → TaskService

File controller: `app/Http/Controllers/TaskController.php`  
File service: `app/Services/TaskService.php`

### 7.1 Konsep Penting: `project_snapshot` (Immutability)

Saat task dibuat, service **menyimpan snapshot data project saat itu** ke kolom
JSON `project_snapshot`. Ketika project di-update di kemudian hari, snapshot
di task **tidak berubah** — ini memenuhi syarat "immutable historical data".

### 7.2 Alur `store`

```
POST /tasks  {project_id, title, description, status, priority, due_date, meta{}}
    │
    ▼ TaskRequest::rules() — validasi
    │
    ▼ TaskController::store()
    │
    ▼ TaskService::create($data)
    │   ├── snapshotProject($data['project_id'])
    │   │     ├── Project::findOrFail($projectId)
    │   │     └── return [id, code, name, captured_at]  ← snapshot di-freeze
    │   ├── $data['project_snapshot'] = snapshot tadi
    │   └── TaskRepository::create($data)  ← INSERT tasks
    │         (project_snapshot tersimpan sebagai JSON)
    │
    ▼ toastBack('Task created successfully.')
```

### 7.3 Alur `update`

```
PUT /tasks/{task}
    │
    ▼ TaskService::update($id, $data)
    │   └── TaskRepository::update($id, $data)
    │         ← project_snapshot TIDAK diupdate (sengaja — immutability)
```

### 7.4 Alur `index`

```
GET /tasks?project_id=<uuid>&status=in_progress
    │
    ▼ TaskService::paginate($filters)
    │   ├── $query = TaskRepository::query()
    │   │     ->with('project')
    │   │     ->withCount('documents')
    │   ├── applySearch(['title','description'])
    │   ├── jika project_id ada: WHERE project_id = ?
    │   ├── jika status ada: WHERE status = ?
    │   └── applySort(['title','status','priority','due_date','created_at'])
```

---

## 8. DocumentController → DocumentService

File controller: `app/Http/Controllers/DocumentController.php`  
File service: `app/Services/DocumentService.php`

### 8.1 Konsep Penting: `task_snapshot` + Upload PDF

Sama dengan task-project, dokumen menyimpan **snapshot task** saat upload.
File PDF disimpan di `storage/app/documents/` (disk `local`, tidak public).

### 8.2 Alur `store` (upload dokumen)

```
POST /documents  {task_id, title, is_verified, properties{}, file: <PDF>}
    │
    ▼ DocumentRequest::rules()
    │   file: required|mimes:pdf|min:100|max:500  ← 100KB–500KB
    │
    ▼ DocumentController::store()
    │   $data = $request->safe()->except('file')   ← pisahkan file dari data
    │   $this->service->create($data, $request->file('file'))
    │
    ▼ DocumentService::create($data, UploadedFile $file)
    │   ├── storeFile($file):
    │   │     ├── $file->store('documents', 'local')  ← simpan ke storage/app/documents/
    │   │     └── return [file_path, file_name, file_size, mime_type]
    │   ├── $data = array_merge($data, fileMetadata)
    │   ├── $data['uploaded_at'] = now()
    │   ├── snapshotTask($data['task_id']):
    │   │     ├── Task::with('project')->findOrFail($taskId)
    │   │     └── return [id, title, status, project{id,code,name}, captured_at]
    │   ├── $data['task_snapshot'] = snapshot
    │   └── DocumentRepository::create($data)  ← INSERT documents
    │
    ▼ toastBack('Document uploaded successfully.')
```

### 8.3 Alur `update` (replace file opsional)

```
PUT /documents/{document}  {title, is_verified, properties{}, file?: <PDF>}
    │
    ▼ DocumentService::update($id, $data, ?UploadedFile $file)
    │   ├── DocumentRepository::findOrFail($id)
    │   ├── jika $file ada:
    │   │     ├── Storage::disk('local')->delete($document->file_path)  ← hapus lama
    │   │     ├── storeFile($file)  ← simpan baru
    │   │     └── update uploaded_at
    │   └── DocumentRepository::update($id, $data)
    │         ← task_snapshot TIDAK diupdate (immutability)
```

### 8.4 Alur `download`

```
GET /documents/{document}/download
    │
    ▼ DocumentController::download(Document $document)
    │   $this->service->download($document->id)
    │
    ▼ DocumentService::download($id)
    │   ├── DocumentRepository::findOrFail($id)
    │   ├── Storage::disk('local')->path($document->file_path)  ← path absolut
    │   └── response()->download($absolutePath, $document->file_name)
    │         └── BinaryFileResponse: Content-Disposition: attachment
```

---

## 9. TransferController → TransferService (Export/Import Queue)

File controller: `app/Http/Controllers/TransferController.php`  
File service: `app/Services/TransferService.php`

### 9.1 Alur Export

```
POST /transfers/export  {entity: 'projects', columns: ['code','name','status']}
    │
    ▼ TransferController::export()
    │   $this->service->startExport('projects', ['code','name','status'], $userId)
    │
    ▼ TransferService::startExport($entity, $columns, $userId)
    │   ├── entityConfig('projects')  ← baca config/transfers.php
    │   ├── validColumns($config, $columns)
    │   │     └── intersect dengan allowed columns → fallback ke semua jika kosong
    │   ├── DataTransfer::create([direction='export', status='pending', ...])
    │   │     └── INSERT data_transfers
    │   └── ProcessExportJob::dispatch($transfer->id)
    │         └── Job masuk ke QUEUE (database/sync)
    │
    ▼ toastBack('Export queued.')
    │
    ▼ (background) ProcessExportJob::handle()
    │   └── TransferService::runExport($transfer)
    │         ├── entityConfig($transfer->entity)
    │         ├── Excel::store(new DynamicExport($model, $columns), $path, 'local')
    │         │     └── Simpan .xlsx ke storage/app/transfers/export-*.xlsx
    │         └── $transfer->markCompleted($path, $rowCount)
    │               └── UPDATE data_transfers SET status='completed', file_path=...
```

### 9.2 Alur Import

```
POST /transfers/import  {entity: 'projects', columns: [...], file: <xlsx>}
    │
    ▼ TransferController::import()
    │   ├── $path = $request->file('file')->store('transfers/imports', 'local')
    │   └── $this->service->startImport('projects', $path, $originalName, $columns, $userId)
    │
    ▼ TransferService::startImport(...)
    │   ├── entityConfig() + cek importable === true
    │   ├── DataTransfer::create([direction='import', status='pending', ...])
    │   └── ProcessImportJob::dispatch($transfer->id)
    │
    ▼ (background) ProcessImportJob::handle()
    │   └── TransferService::runImport($transfer)
    │         ├── Excel::toCollection(new DynamicImport, $filePath, 'local')
    │         ├── foreach $row:
    │         │     ├── mapRow() → mapping kolom header → field model
    │         │     ├── castValue() → auto-cast 'true'/'false' string → boolean
    │         │     └── $modelClass::create($attributes)  ← INSERT
    │         └── $transfer->markCompleted(null, $rowCount)
```

### 9.3 Alur Download Hasil Export

```
GET /transfers/{transfer}/download
    │
    ▼ TransferController::download(DataTransfer $transfer)
    │   ├── abort_unless file_path ada dan exists di disk
    │   ├── Storage::disk('local')->path($transfer->file_path)  ← path absolut
    │   └── response()->download($path, 'projects-export.xlsx')
```

---

## 10. Ringkasan Pola yang Konsisten

| Lapisan | Tanggung Jawab | Tidak Boleh |
|---|---|---|
| **Controller** | Terima request, validasi via FormRequest, panggil service, return Inertia/redirect | Langsung query DB, business logic |
| **Service** | Business logic: snapshot, hash, file ops, filter | Langsung akses model tanpa repository |
| **Repository** | CRUD + query builder | Business logic |
| **Model** | Relasi, casts, auditing, soft delete | Logic apapun |

### Fitur Lintas Lapisan

| Fitur | Cara Kerja |
|---|---|
| **Audit Trail** | `Auditable` trait di model → otomatis rekam `old_values`/`new_values` ke tabel `audits` setiap INSERT/UPDATE/DELETE |
| **Immutable Snapshot** | Service menyimpan JSON snapshot parent saat create, tidak pernah di-update setelahnya |
| **Soft Delete** | `SoftDeletes` trait → `DELETE` hanya set `deleted_at`, data masih ada di DB |
| **UUID Primary Key** | `HasUuids` trait → Laravel auto-generate UUID v7 saat INSERT |
| **Queue** | Export/Import berjalan di background via `php artisan queue:work` |
| **RBAC** | Middleware `role:Administrator` → `EnsureUserHasRole` cek `role_user` pivot |
