import { Box, Text } from "@mantine/core";
import LoadingComp from "./LoadingComp";

function LoadingPage() {
    return (
        <Box
            style={{
                display: "flex",
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Box>
                <LoadingComp />
                <Text ta="center" c="dimmed" fz={14} fw={300} mt={16}>
                    Loading Stickers...
                </Text>
            </Box>
        </Box>
    );
}

export default LoadingPage;
