import { Tooltip, ActionIcon } from "@mantine/core";
import { IconDeselect } from "@tabler/icons-react";

type DeselectLayerProps = {
    title?: string;
    disabled: boolean;
    deselectFunc: Function;
};

function DeselectLayer({ disabled, deselectFunc, title = "Deselect Layer" }: DeselectLayerProps) {
    return (
        <>
            <Tooltip label={title}>
                <ActionIcon
                    variant="light"
                    color="blue"
                    aria-label={title}
                    disabled={disabled}
                    onClick={() => deselectFunc()}
                >
                    <IconDeselect style={{ width: "70%", height: "70%" }} stroke={1.5} />
                </ActionIcon>
            </Tooltip>
        </>
    );
}

export default DeselectLayer;
