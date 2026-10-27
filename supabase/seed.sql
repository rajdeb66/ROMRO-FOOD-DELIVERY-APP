insert into public.restaurants (id, name, cuisine, category, rating, eta_text, price_for_two, emoji, offer_text, distance, delivery_fee)
values
  ('spice', 'The Spice Route', 'North Indian · Biryani', 'Indian', 4.8, '25–30 min', 350, '🍛', '20% OFF', '1.2 km', 29),
  ('dosa', 'Dosa District', 'South Indian · Breakfast', 'South Indian', 4.7, '20–25 min', 250, '🥞', 'Free delivery', '0.8 km', 0),
  ('wok', 'Wok This Way', 'Chinese · Asian', 'Chinese', 4.6, '30–35 min', 400, '🍜', '₹100 OFF', '2.1 km', 29),
  ('oven', 'Little Oven', 'Pizza · Italian', 'Pizza', 4.5, '25–35 min', 500, '🍕', 'Buy 1 Get 1', '1.6 km', 29),
  ('sweet', 'Sugar & Spice', 'Desserts · Bakery', 'Desserts', 4.9, '20–25 min', 300, '🍰', 'Fresh today', '1.0 km', 29),
  ('green', 'Green Bowl Co.', 'Healthy · Salad bowls', 'Healthy', 4.7, '20–30 min', 400, '🥗', '15% OFF', '2.4 km', 29)
on conflict (id) do nothing;

insert into public.menu_items (restaurant_id, id, name, detail, price, emoji)
values
  ('spice', 'butter', 'Butter Paneer Masala', 'Creamy tomato gravy, house spice blend', 289, '🍲'),
  ('spice', 'biryani', 'Hyderabadi Dum Biryani', 'Slow cooked basmati rice, raita on the side', 329, '🍛'),
  ('spice', 'naan', 'Garlic Butter Naan', 'Tandoor baked and brushed with butter', 69, '🫓'),
  ('dosa', 'masala-dosa', 'Mysore Masala Dosa', 'Crisp dosa, potato masala, coconut chutney', 189, '🥞'),
  ('dosa', 'idli', 'Steamed Idli (3 pcs)', 'Soft idlis with sambar and chutneys', 99, '🥥'),
  ('dosa', 'vada', 'Medu Vada (2 pcs)', 'Golden lentil fritters with sambar', 109, '🍩'),
  ('wok', 'noodles', 'Chilli Garlic Noodles', 'Wok-tossed noodles, seasonal vegetables', 249, '🍜'),
  ('wok', 'manchurian', 'Veg Manchurian', 'Crispy veg balls in a tangy sauce', 219, '🥡'),
  ('wok', 'rice', 'Schezwan Fried Rice', 'Spicy rice with vegetables and spring onion', 229, '🍚'),
  ('oven', 'margherita', 'Classic Margherita', 'Mozzarella, basil, slow-cooked tomato', 299, '🍕'),
  ('oven', 'farmhouse', 'Garden Farmhouse', 'Peppers, olives, onion, mushroom', 379, '🫑'),
  ('oven', 'garlic-bread', 'Cheesy Garlic Bread', 'Oven-baked with herbs and mozzarella', 159, '🥖'),
  ('sweet', 'cake', 'Chocolate Truffle Cake', 'Rich dark chocolate, made fresh today', 199, '🍰'),
  ('sweet', 'gulab', 'Gulab Jamun (2 pcs)', 'Warm, soft and soaked in rose syrup', 89, '🍮'),
  ('sweet', 'brownie', 'Walnut Brownie', 'Fudgy chocolate with toasted walnuts', 129, '🍫'),
  ('green', 'buddha', 'Buddha Bowl', 'Quinoa, roasted vegetables, tahini', 289, '🥗'),
  ('green', 'paneer-bowl', 'Tandoori Paneer Bowl', 'Brown rice, paneer, mint yoghurt', 309, '🥙'),
  ('green', 'smoothie', 'Mango Smoothie', 'Alphonso mango blended with yoghurt', 149, '🥭')
on conflict (restaurant_id, id) do nothing;
