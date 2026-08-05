import {
    ActionIcon,
    Button,
    Drawer,
    FileButton,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { IconDownload, IconFileImport, IconFolderOpen, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useProjectStore from "../../store/projectStore";
import { restoreAssetUrls } from "../../utils/assetStorage";
import { StickerObject } from "../../utils/createSticker";
import {
    createProjectDocument,
    downloadProject,
    importProjectAssets,
    parseProjectDocument,
} from "../../utils/projectUtils";

interface ProjectManagerProps {
    opened: boolean;
    onClose: () => void;
    layers: StickerObject[];
    onLoad: (layers: StickerObject[]) => void;
}

function ProjectManager({ opened, onClose, layers, onLoad }: ProjectManagerProps) {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const projects = useProjectStore((state) => state.projects);
    const saveProject = useProjectStore((state) => state.saveProject);
    const removeProject = useProjectStore((state) => state.removeProject);

    function saveCurrentProject() {
        const project = createProjectDocument(name, layers);
        saveProject(project);
        setName("");
        notifications.show({ title: t("Project saved"), message: project.name });
    }

    async function importProject(file: File | null) {
        if (!file) return;
        try {
            const project = parseProjectDocument(await file.text());
            await importProjectAssets(project);
            saveProject({ ...project, assets: undefined });
            notifications.show({ title: t("Project imported"), message: project.name });
        } catch (error) {
            notifications.show({
                color: "red",
                title: t("Error"),
                message: (error as Error).message,
            });
        }
    }

    async function loadProject(projectId: string) {
        const project = projects.find((item) => item.id === projectId);
        if (!project) return;
        onLoad(await restoreAssetUrls(project.layers));
        onClose();
        notifications.show({ title: t("Project loaded"), message: project.name });
    }

    function confirmRemoveProject(id: string) {
        modals.openConfirmModal({
            title: t("Delete project"),
            children: <Text size="sm">{t("This project will be permanently deleted")}</Text>,
            labels: { confirm: t("Delete project"), cancel: t("Cancel") },
            confirmProps: { color: "red" },
            onConfirm: () => removeProject(id),
        });
    }

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={t("Projects")}
            position="bottom"
            size="75%"
            radius="md"
            closeButtonProps={{ "aria-label": t("Close projects") }}
        >
            <Group align="flex-end" mb="lg">
                <TextInput
                    label={t("Project name")}
                    placeholder={t("Untitled sticker")}
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                    style={{ flex: 1 }}
                />
                <Button onClick={saveCurrentProject}>{t("Save current project")}</Button>
                <FileButton onChange={importProject} accept="application/json,.json">
                    {(props) => (
                        <Button
                            {...props}
                            variant="default"
                            leftSection={<IconFileImport size={16} />}
                        >
                            {t("Import JSON")}
                        </Button>
                    )}
                </FileButton>
            </Group>

            {projects.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">
                    {t("No saved projects yet")}
                </Text>
            )}

            <Stack gap="sm">
                {projects.map((project) => (
                    <Paper key={project.id} withBorder p="md" radius="md">
                        <Group justify="space-between" wrap="nowrap">
                            <div>
                                <Text fw={600}>{project.name}</Text>
                                <Text size="xs" c="dimmed">
                                    {new Date(project.updatedAt).toLocaleString()} ·{" "}
                                    {project.layers.length} {t("Layers").toLowerCase()}
                                </Text>
                            </div>
                            <Group gap="xs" wrap="nowrap">
                                <Tooltip label={t("Load project")}>
                                    <ActionIcon
                                        size={40}
                                        variant="light"
                                        aria-label={t("Load project")}
                                        onClick={() => loadProject(project.id)}
                                    >
                                        <IconFolderOpen size={20} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label={t("Export project JSON")}>
                                    <ActionIcon
                                        size={40}
                                        variant="light"
                                        aria-label={t("Export project JSON")}
                                        onClick={() => void downloadProject(project)}
                                    >
                                        <IconDownload size={20} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label={t("Delete project")}>
                                    <ActionIcon
                                        size={40}
                                        variant="light"
                                        color="red"
                                        aria-label={t("Delete project")}
                                        onClick={() => confirmRemoveProject(project.id)}
                                    >
                                        <IconTrash size={20} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>
                    </Paper>
                ))}
            </Stack>
        </Drawer>
    );
}

export default ProjectManager;
