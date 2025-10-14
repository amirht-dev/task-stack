# TaskStack: Project & Task Management App 🚀

[![Live preview](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://task-stack-ten.vercel.app/)

**TaskStack** is a collaborative task management application designed to help teams organize projects, manage workflows, and schedule tasks efficiently. With robust authentication options, collaborative workspaces, and an intuitive drag-and-drop interface, getting your projects done has never been easier. **[Check out the live preview here!](https://task-stack-ten.vercel.app/)**

## ✨ Features

- **Diverse Authentication:** Sign in securely using **Google** or **GitHub OAuth**, or sign up with a traditional **Email & Password** method.
- **Collaborative Workspaces:** Create dedicated **Workspaces** for different projects and invite team members to collaborate.
- **Task Scheduling & Management:** Project owners can easily **create, schedule, and assign tasks** within a workspace.
- **Intuitive Interface:** Manage tasks with a seamless **Drag-and-Drop (DnD)** experience.
- **Dashboard Overview:** Get a clear view of your projects, tasks, and team activities from a central dashboard.
- **Modern UI:** A clean, accessible, and responsive user interface built with **shadcn/ui** and **Radix UI**.

---

## 💻 Tech Stack

TaskStack is built on the modern and powerful **Next.js App Router** architecture, leveraging a comprehensive set of cutting-edge technologies for a fast, scalable, and delightful user experience.

| Category               | Technology                       | Purpose                                                                                                  |
| :--------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Frontend Framework** | **Next.js** (App Router)         | The React framework for production, providing routing, server components, and performance optimizations. |
| **Language**           | **TypeScript**                   | Adds static type definitions for enhanced code quality and developer experience.                         |
| **Styling**            | **Tailwind CSS**, **shadcn/ui**  | Utility-first CSS framework and a collection of beautiful, accessible components for styling.            |
| **State Management**   | **Zustand**                      | A small, fast, and scalable state-management solution.                                                   |
| **Data Fetching**      | **TanStack Query** (React Query) | Handles data synchronization, caching, and state management for server-side data.                        |
| **UI Primitives**      | **Radix UI**                     | Low-level, accessible components for building high-quality design systems.                               |
| **Forms**              | **React Hook Form**              | High-performance, flexible, and extensible forms with easy-to-use validation.                            |
| **Drag & Drop**        | **dnd-kit**                      | A light and powerful drag-and-drop toolkit for React.                                                    |
| **Data Grid**          | **TanStack Table**               | Headless UI for building powerful and flexible tables.                                                   |
| **Database/Backend**   | **Appwrite**                     | A self-hosted backend server that provides a reliable database and handles authentication.               |
| **Date Management**    | **date-fns**                     | Provides comprehensive and simple functions for manipulating JavaScript dates.                           |

---

## 🛠️ Getting Started

Follow these steps to get a local copy of TaskStack up and running on your machine.

### Prerequisites

You'll need the following installed:

- [Node.js](https://nodejs.org/en/download/) (v18+)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- An active **Appwrite** instance (either self-hosted or via Appwrite Cloud).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/amirht-dev/task-stack
    cd task-stack
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```

3.  **Configure Environment Variables:**

    Create a file named `.env.local` in the root directory and add your Appwrite credentials and OAuth keys:

    ```bash
    NEXT_PUBLIC_APPWRITE_PROJECT_ID = '<appwrite project id>'
    NEXT_PUBLIC_APPWRITE_PROJECT_NAME = '<appwrite project name>'
    NEXT_PUBLIC_APPWRITE_HOSTNAME = '<appwrite project hostname>'
    NEXT_PUBLIC_APPWRITE_ENDPOINT = '<appwrite project endpoint>'

    NEXT_APPWRITE_KEY = '<appwrite project api key with auth and database.rows.read and database.rows.write scopes>'

    NEXT_PUBLIC_APPWRITE_DATABASE_ID = '<appwrite project database id>'
    NEXT_PUBLIC_APPWRITE_WORKSPACES_ID = '<appwrite project database workspaces table id>'
    NEXT_PUBLIC_APPWRITE_PROFILES_ID = '<appwrite project database profiles table id>'
    NEXT_PUBLIC_APPWRITE_PROJECTS_ID = '<appwrite project database projects table id>'
    NEXT_PUBLIC_APPWRITE_TASKS_ID = '<appwrite project database tasks table id>'
    NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID = '<appwrite project database images bucket id>'


    NEXT_PUBLIC_ORIGIN_URL = '<app origin url. e.g. http://localhost:3000 for development or vercel domain for production>'
    ```

    _Note: Ensure you have correctly configured your Appwrite database, collections, and security rules._

4.  **Run the application:**

    ```bash
    npm run dev
    # or yarn dev
    # or pnpm dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📞 Contact

Email: amirht.dev@gmail.com

Project Link: [https://github.com/amirht-dev/task-stack](https://github.com/amirht-dev/task-stack)

Live preview: [https://task-stack-ten.vercel.app/](https://task-stack-ten.vercel.app/)
