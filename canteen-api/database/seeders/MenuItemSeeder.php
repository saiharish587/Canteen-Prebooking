<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuItem;

class MenuItemSeeder extends Seeder
{
    public function run()
    {
        $menuItems = [
            // Breakfast Items
            ['name' => 'Idli (4 pcs)', 'category' => 'breakfast', 'price' => 35, 'description' => 'Soft steamed Idli with sambar & chutney', 'is_vegetarian' => true, 'preparation_time_mins' => 10],
            ['name' => 'Plain Dosa', 'category' => 'breakfast', 'price' => 45, 'description' => 'Crispy rice crepe with sambar & chutney', 'is_vegetarian' => true, 'preparation_time_mins' => 12],
            ['name' => 'Masala Dosa', 'category' => 'breakfast', 'price' => 50, 'description' => 'Crispy dosa with spiced potato filling', 'is_vegetarian' => true, 'preparation_time_mins' => 12],
            ['name' => 'Puri (4 pcs)', 'category' => 'breakfast', 'price' => 35, 'description' => 'Puri with potato curry', 'is_vegetarian' => true, 'preparation_time_mins' => 10],
            ['name' => 'Upma', 'category' => 'breakfast', 'price' => 30, 'description' => 'Tasty and healthy', 'is_vegetarian' => true, 'preparation_time_mins' => 8],
            ['name' => 'Pesarattu', 'category' => 'breakfast', 'price' => 50, 'description' => 'Green gram dosa', 'is_vegetarian' => true, 'preparation_time_mins' => 12],
            ['name' => 'Poha', 'category' => 'breakfast', 'price' => 30, 'description' => 'Flattened rice with peanuts & onions', 'is_vegetarian' => true, 'preparation_time_mins' => 8],
            ['name' => 'Egg Dosa', 'category' => 'breakfast', 'price' => 55, 'description' => 'Dosa topped with scrambled egg', 'is_vegetarian' => false, 'preparation_time_mins' => 12],
            
            // Meals
            ['name' => 'Veg Meals (Full)', 'category' => 'meals', 'price' => 100, 'description' => 'Unlimited Rice + Veg Curries', 'is_vegetarian' => true, 'preparation_time_mins' => 15],
            ['name' => 'Veg Meals (Mini)', 'category' => 'meals', 'price' => 70, 'description' => 'Limited Rice + Veg Curry', 'is_vegetarian' => true, 'preparation_time_mins' => 12],
            ['name' => 'Curd Rice', 'category' => 'meals', 'price' => 50, 'description' => 'Cool yogurt rice with pickle', 'is_vegetarian' => true, 'preparation_time_mins' => 5],
            ['name' => 'Sambar Rice', 'category' => 'meals', 'price' => 50, 'description' => 'Rice mixed with sambar', 'is_vegetarian' => true, 'preparation_time_mins' => 8],
            ['name' => 'Lemon Rice', 'category' => 'meals', 'price' => 50, 'description' => 'Tangy lemon flavored rice', 'is_vegetarian' => true, 'preparation_time_mins' => 8],
            ['name' => 'Pulihora', 'category' => 'meals', 'price' => 50, 'description' => 'Traditional tamarind rice', 'is_vegetarian' => true, 'preparation_time_mins' => 8],
            ['name' => 'Chapati (2 pcs)', 'category' => 'meals', 'price' => 20, 'description' => 'Soft chapatis', 'is_vegetarian' => true, 'preparation_time_mins' => 8],
            ['name' => 'Roti with Dal', 'category' => 'meals', 'price' => 55, 'description' => '2 Rotis with dal fry', 'is_vegetarian' => true, 'preparation_time_mins' => 12],
            ['name' => 'Chicken Meals (Full)', 'category' => 'meals', 'price' => 130, 'description' => 'Unlimited Rice + Chicken Curry', 'is_vegetarian' => false, 'preparation_time_mins' => 15],
            ['name' => 'Chicken Meals (Mini)', 'category' => 'meals', 'price' => 105, 'description' => 'Limited Rice + Chicken Curry', 'is_vegetarian' => false, 'preparation_time_mins' => 12],
            ['name' => 'Chicken + Chapati', 'category' => 'meals', 'price' => 100, 'description' => 'Chapatis with chicken curry', 'is_vegetarian' => false, 'preparation_time_mins' => 15],
            
            // Vegetarian Items
            ['name' => 'Veg Biryani', 'category' => 'veg', 'price' => 100, 'description' => 'Fragrant rice with vegetables', 'is_vegetarian' => true, 'preparation_time_mins' => 15],
            ['name' => 'Veg Fried Rice', 'category' => 'veg', 'price' => 60, 'description' => 'Stir-fried rice with vegetables', 'is_vegetarian' => true, 'preparation_time_mins' => 10],
            ['name' => 'Veg Noodles', 'category' => 'veg', 'price' => 60, 'description' => 'Hakka noodles with vegetables', 'is_vegetarian' => true, 'preparation_time_mins' => 10],
            ['name' => 'Veg Manchuria', 'category' => 'veg', 'price' => 60, 'description' => 'Crispy vegetable balls in sauce', 'is_vegetarian' => true, 'preparation_time_mins' => 12],
            ['name' => 'Paneer Curry', 'category' => 'veg', 'price' => 80, 'description' => 'Cottage cheese in spicy gravy', 'is_vegetarian' => true, 'preparation_time_mins' => 12],
            ['name' => 'Gobi Manchuria', 'category' => 'veg', 'price' => 70, 'description' => 'Crispy cauliflower in spicy sauce', 'is_vegetarian' => true, 'preparation_time_mins' => 10],
            
            // Non-Vegetarian Items
            ['name' => 'Chicken Biryani', 'category' => 'nonveg', 'price' => 140, 'description' => 'Hyderabadi style biryani', 'is_vegetarian' => false, 'preparation_time_mins' => 15],
            ['name' => 'Egg Biryani', 'category' => 'nonveg', 'price' => 90, 'description' => 'Rice with boiled eggs', 'is_vegetarian' => false, 'preparation_time_mins' => 12],
            ['name' => 'Chicken Fried Rice', 'category' => 'nonveg', 'price' => 80, 'description' => 'Fried rice with chicken', 'is_vegetarian' => false, 'preparation_time_mins' => 10],
            ['name' => 'Egg Fried Rice', 'category' => 'nonveg', 'price' => 80, 'description' => 'Fried rice with scrambled eggs', 'is_vegetarian' => false, 'preparation_time_mins' => 10],
            ['name' => 'Chicken Noodles', 'category' => 'nonveg', 'price' => 80, 'description' => 'Hakka noodles with chicken', 'is_vegetarian' => false, 'preparation_time_mins' => 10],
            
            // Snacks
            ['name' => 'Samosa (2 pcs)', 'category' => 'snacks', 'price' => 20, 'description' => 'Crispy pastry with potato', 'is_vegetarian' => true, 'preparation_time_mins' => 5],
            ['name' => 'Veg Puff (2 pcs)', 'category' => 'snacks', 'price' => 30, 'description' => 'Flaky puff with veg filling', 'is_vegetarian' => true, 'preparation_time_mins' => 5],
            ['name' => 'Egg Puff (2 pcs)', 'category' => 'snacks', 'price' => 35, 'description' => 'Puff pastry with egg', 'is_vegetarian' => false, 'preparation_time_mins' => 5],
            ['name' => 'Mirchi Bajji (4 pcs)', 'category' => 'snacks', 'price' => 30, 'description' => 'Stuffed chili fritters', 'is_vegetarian' => true, 'preparation_time_mins' => 8],
            ['name' => 'Punugulu (6 pcs)', 'category' => 'snacks', 'price' => 20, 'description' => 'Crispy rice dumplings', 'is_vegetarian' => true, 'preparation_time_mins' => 5],
            ['name' => 'Maggi Noodles', 'category' => 'snacks', 'price' => 40, 'description' => 'Hot masala maggi', 'is_vegetarian' => true, 'preparation_time_mins' => 5],
            
            // Beverages
            ['name' => 'Tea', 'category' => 'beverages', 'price' => 15, 'description' => 'Hot masala chai', 'is_vegetarian' => true, 'preparation_time_mins' => 3],
            ['name' => 'Coffee', 'category' => 'beverages', 'price' => 25, 'description' => 'Traditional filter coffee', 'is_vegetarian' => true, 'preparation_time_mins' => 3],
            ['name' => 'Thumps Up', 'category' => 'beverages', 'price' => 30, 'description' => 'Energizing cola drink - 400ml', 'is_vegetarian' => true, 'preparation_time_mins' => 2],
            ['name' => 'Mountain Dew', 'category' => 'beverages', 'price' => 30, 'description' => 'Citrus soda with intense flavor - 400ml', 'is_vegetarian' => true, 'preparation_time_mins' => 2],
            ['name' => 'Pulpy', 'category' => 'beverages', 'price' => 30, 'description' => 'Fruit juice with pulp - 400ml', 'is_vegetarian' => true, 'preparation_time_mins' => 2],
            ['name' => 'Maaza', 'category' => 'beverages', 'price' => 30, 'description' => 'Mango fruit juice - 400ml', 'is_vegetarian' => true, 'preparation_time_mins' => 2],
            ['name' => 'Nimboz', 'category' => 'beverages', 'price' => 30, 'description' => 'Citrus flavored drink - 400ml', 'is_vegetarian' => true, 'preparation_time_mins' => 2],
            ['name' => 'Badam Milk', 'category' => 'beverages', 'price' => 45, 'description' => 'Nutritious almond milk drink', 'is_vegetarian' => true, 'preparation_time_mins' => 3],
        ];

        foreach ($menuItems as $item) {
            MenuItem::firstOrCreate(
                ['name' => $item['name']],
                [
                    'name' => $item['name'],
                    'category' => $item['category'],
                    'price' => $item['price'],
                    'description' => $item['description'],
                    'is_vegetarian' => $item['is_vegetarian'],
                    'is_available' => true,
                ]
            );
        }

        $this->command->info('Menu items seeded successfully!');
    }
}
