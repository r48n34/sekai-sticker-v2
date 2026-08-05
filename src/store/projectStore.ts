import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CURRENT_PROJECT_VERSION, ProjectDocument } from "../utils/projectUtils";

interface ProjectState {
    projects: ProjectDocument[];
    saveProject: (project: ProjectDocument) => void;
    removeProject: (id: string) => void;
}

const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            projects: [],
            saveProject: (project) =>
                set((state) => ({
                    projects: [project, ...state.projects.filter((item) => item.id !== project.id)],
                })),
            removeProject: (id) =>
                set((state) => ({ projects: state.projects.filter((item) => item.id !== id) })),
        }),
        { name: "sekai-projects", version: CURRENT_PROJECT_VERSION },
    ),
);

export default useProjectStore;
