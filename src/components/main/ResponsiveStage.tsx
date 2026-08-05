import { Box } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { ReactNode } from "react";

interface ResponsiveStageProps {
    width: number;
    height: number;
    children: ReactNode;
}

function ResponsiveStage({ width, height, children }: ResponsiveStageProps) {
    const { ref, width: availableWidth } = useElementSize();
    const scale = availableWidth > 0 ? Math.min(1, availableWidth / width) : 1;

    return (
        <Box ref={ref} w="100%" maw={width} mx="auto" style={{ height: height * scale }}>
            <Box
                style={{
                    width,
                    height,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default ResponsiveStage;
