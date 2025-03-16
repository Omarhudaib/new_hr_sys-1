<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            ['name' => 'Add_User', 'description' => 'Permission to add a new user'],
            ['name' => 'Edit_User', 'description' => 'Permission to edit user details'],
            ['name' => 'Add_Rating', 'description' => 'Permission to add a rating'],
            ['name' => 'Edit_Rating', 'description' => 'Permission to edit ratings'],
            ['name' => 'Edit_Login/Logout_Operations', 'description' => 'Permission to edit login/logout operations'],
            ['name' => 'View_Login/Logout_Summary', 'description' => 'Permission to view login/logout summary'],
            ['name' => 'Approve_Employee_Requests', 'description' => 'Permission to approve employee requests'],
            ['name' => 'Edit_Employee_Requests', 'description' => 'Permission to edit employee requests'],
            ['name' => 'View_User', 'description' => 'Permission to view users'],
            ['name' => 'View_Rating', 'description' => 'Permission to view users rating'],

        ];

        foreach ($permissions as $permission) {
            // تحقق من وجود السجل وإنشاؤه إذا لم يكن موجودًا
            Permission::firstOrCreate(
                ['name' => $permission['name']], // البحث باستخدام الاسم
                ['description' => $permission['description']] // إنشاء السجل إذا لم يوجد
            );
        }
    }
}
