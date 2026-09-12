# Tutoree

Tutoree is a clean, minimalistic Tuition Fees Tracker website built specifically for teachers. It serves as a modern replacement for complex Excel sheets, allowing teachers to manage their students and track monthly tuition payments effortlessly.

## 🚀 Features

- **Teacher Authentication:** Secure Login, Signup, and Password Reset functionality. Each teacher manages their own isolated list of students.
- **Student Management:** Add, edit, and delete students. View students neatly grouped by their classes for better organization.
- **Monthly Fee Tracking:** Easily mark students as "Paid" or "Unpaid" for any selected month with a single click.
- **Dashboard & Analytics:** View monthly collections, expected revenue, and outstanding payments at a glance.
- **Clean & Fast UI:** A premium, minimalistic interface that is extremely fast and easy to navigate.

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Routing:** React Router DOM

## ⚙️ Local Development Setup

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/theyuvankrish/Tutoree.git
   cd Tutoree
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a new project on [Supabase](https://supabase.com).
   - Run the provided `supabase-setup.sql` script in your Supabase SQL Editor to create the necessary tables and row-level security (RLS) policies.
   - Obtain your Project URL and Anon Public Key from the Supabase dashboard.

4. **Configure Environment Variables:**
   Create a `.env` file in the root of the project and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Import the repository into your Vercel dashboard.
3. During setup, ensure you add the **Environment Variables** (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Vercel deployment settings.
4. Deploy!

## 📄 License

This project is licensed under the MIT License.
