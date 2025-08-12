-- ======================================
-- TASKRABBIT-STYLE APP DATABASE SCHEMA
-- Complete SQL for Supabase
-- ======================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- 1. PROFILES TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text,
  phone text,
  role text CHECK (role IN ('customer', 'tasker')) NOT NULL DEFAULT 'customer',
  
  -- Tasker specific fields
  hourly_rate decimal(10,2),
  bio text,
  skills text[],
  available boolean DEFAULT true,
  verification_status text CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  
  -- Location
  address text,
  city text,
  state text,
  zip_code text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  
  -- Stats
  total_tasks_completed integer DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ======================================
-- 2. TASK CATEGORIES (TaskRabbit style)
-- ======================================
CREATE TABLE IF NOT EXISTS public.task_categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert TaskRabbit-like categories
INSERT INTO public.task_categories (name, slug, description, icon, color, sort_order) VALUES
('Mounting & Installation', 'mounting', 'TV mounting, shelves, art, mirrors', 'construct', '#FF6B35', 1),
('Furniture Assembly', 'furniture', 'IKEA and other furniture assembly', 'construct', '#4ECDC4', 2),
('Moving Help', 'moving', 'Loading, unloading, packing assistance', 'car', '#45B7D1', 3),
('Cleaning', 'cleaning', 'Home cleaning, deep cleaning, organizing', 'sparkles', '#96CEB4', 4),
('Delivery', 'delivery', 'Pick up and delivery services', 'bicycle', '#FFEAA7', 5),
('Handyman', 'handyman', 'General repairs and maintenance', 'hammer', '#DDA0DD', 6),
('Electrical', 'electrical', 'Light fixtures, outlets, switches', 'flash', '#FFD93D', 7),
('Plumbing', 'plumbing', 'Faucets, toilets, minor repairs', 'water', '#6C5CE7', 8),
('Painting', 'painting', 'Interior painting, touch-ups', 'color-palette', '#FF7675', 9),
('Yard Work', 'yard', 'Lawn care, gardening, landscaping', 'leaf', '#00B894', 10)
ON CONFLICT (slug) DO NOTHING;

-- ======================================
-- 3. TASKS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tasker_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.task_categories(id) NOT NULL,
  
  -- Task details
  title text NOT NULL,
  description text NOT NULL,
  
  -- Location
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  
  -- Scheduling
  task_date date,
  task_time time,
  flexible_date boolean DEFAULT false,
  estimated_hours decimal(4,2),
  
  -- Pricing
  budget_min decimal(10,2),
  budget_max decimal(10,2),
  final_price decimal(10,2),
  task_size text CHECK (task_size IN ('small', 'medium', 'large')) DEFAULT 'medium',
  
  -- Status
  status text CHECK (status IN ('posted', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'posted',
  urgency text CHECK (urgency IN ('flexible', 'within_week', 'urgent')) DEFAULT 'flexible',
  
  -- Additional details
  task_details jsonb,
  special_instructions text,
  photos text[],
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at timestamp with time zone
);

-- ======================================
-- 4. TASK APPLICATIONS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS public.task_applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tasker_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  message text,
  proposed_price decimal(10,2),
  estimated_time decimal(4,2),
  availability_date date,
  
  status text CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(task_id, tasker_id)
);

-- ======================================
-- 5. REVIEWS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text,
  photos text[],
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(task_id, reviewer_id)
);

-- ======================================
-- 6. MESSAGES TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  content text NOT NULL,
  message_type text CHECK (message_type IN ('text', 'image', 'system')) DEFAULT 'text',
  attachments text[],
  
  read_at timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ======================================
-- 7. NOTIFICATIONS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('task', 'application', 'message', 'review', 'system')) DEFAULT 'system',
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  data jsonb
);

-- ======================================
-- ROW LEVEL SECURITY POLICIES
-- ======================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Task categories policies
CREATE POLICY "Task categories are viewable by everyone" ON public.task_categories
  FOR SELECT USING (is_active = true);

-- Tasks policies
CREATE POLICY "Users can view all active tasks" ON public.tasks
  FOR SELECT USING (status != 'cancelled');

CREATE POLICY "Customers can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer')
  );

CREATE POLICY "Task owners and assigned taskers can update tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = tasker_id);

-- Task applications policies
CREATE POLICY "Task applications viewable by task owner and applicant" ON public.task_applications
  FOR SELECT USING (
    auth.uid() = tasker_id OR 
    auth.uid() = (SELECT customer_id FROM public.tasks WHERE id = task_id)
  );

CREATE POLICY "Taskers can create applications" ON public.task_applications
  FOR INSERT WITH CHECK (
    auth.uid() = tasker_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tasker')
  );

CREATE POLICY "Applications can be updated by tasker or customer" ON public.task_applications
  FOR UPDATE USING (
    auth.uid() = tasker_id OR 
    auth.uid() = (SELECT customer_id FROM public.tasks WHERE id = task_id)
  );

-- Reviews policies
CREATE POLICY "Reviews are publicly viewable" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for completed tasks" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = task_id 
      AND status = 'completed' 
      AND (customer_id = auth.uid() OR tasker_id = auth.uid())
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages for their tasks" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages for their tasks" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = task_id 
      AND (customer_id = auth.uid() OR tasker_id = auth.uid())
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ======================================
-- FUNCTIONS AND TRIGGERS
-- ======================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile stats
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS trigger AS $$
BEGIN
  -- Update tasker stats when a review is added
  IF TG_TABLE_NAME = 'reviews' THEN
    UPDATE public.profiles SET
      average_rating = (
        SELECT AVG(rating)::decimal(3,2) 
        FROM public.reviews 
        WHERE reviewee_id = NEW.reviewee_id
      ),
      total_reviews = (
        SELECT COUNT(*) 
        FROM public.reviews 
        WHERE reviewee_id = NEW.reviewee_id
      ),
      updated_at = now()
    WHERE id = NEW.reviewee_id;
  END IF;
  
  -- Update completed tasks count when task is completed
  IF TG_TABLE_NAME = 'tasks' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles SET
      total_tasks_completed = total_tasks_completed + 1,
      updated_at = now()
    WHERE id = NEW.tasker_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_stats_on_review ON public.reviews;
DROP TRIGGER IF EXISTS update_stats_on_task_completion ON public.tasks;

-- Create triggers for stats updates
CREATE TRIGGER update_stats_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

CREATE TRIGGER update_stats_on_task_completion
  AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_applications_updated_at BEFORE UPDATE ON public.task_applications 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================================
-- INDEXES FOR PERFORMANCE
-- ======================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_profiles_available ON public.profiles(available) WHERE role = 'tasker';
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON public.tasks(city, state);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON public.tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_customer ON public.tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tasker ON public.tasks(tasker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);

-- Task applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_task ON public.task_applications(task_id);
CREATE INDEX IF NOT EXISTS idx_applications_tasker ON public.task_applications(tasker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.task_applications(status);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_task ON public.messages(task_id);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_task ON public.reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- ======================================
-- SAMPLE DATA (Optional - for testing)
-- ======================================

-- You can uncomment this section to add sample data for testing

/*
-- Sample profiles (you'll need real auth.users IDs)
INSERT INTO public.profiles (id, email, full_name, username, role, bio, skills, hourly_rate, city, state) VALUES
('sample-customer-id', 'customer@example.com', 'John Customer', 'johncustomer', 'customer', NULL, NULL, NULL, 'New York', 'NY'),
('sample-tasker-id', 'tasker@example.com', 'Jane Tasker', 'janetasker', 'tasker', 'Experienced handyman with 5+ years experience', ARRAY['Mounting', 'Assembly', 'Electrical'], 65.00, 'New York', 'NY');

-- Sample tasks
INSERT INTO public.tasks (customer_id, category_id, title, description, address, city, state, zip_code, task_size, budget_min, budget_max, urgency) 
SELECT 
  'sample-customer-id',
  id,
  'Mount 65" TV above fireplace',
  'Need help mounting a large TV above the fireplace. TV and mount are already purchased.',
  '123 Main St',
  'New York',
  'NY',
  '10001',
  'medium',
  75.00,
  100.00,
  'within_week'
FROM public.task_categories WHERE slug = 'mounting' LIMIT 1;
*/

-- ======================================
-- COMPLETION MESSAGE
-- ======================================

DO $$
BEGIN
    RAISE NOTICE 'TaskRabbit-style database schema created successfully!';
    RAISE NOTICE 'Tables created: profiles, task_categories, tasks, task_applications, reviews, messages, notifications';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE 'Triggers and functions created for auto-profile creation and stats updates';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Ready to start using the TaskRabbit clone!';
END $$;