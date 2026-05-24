import { Box, Button, Group, Text } from "@mantine/core";
import { IconMoodSad } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

function ErrorStatusComp() {
    const navigate = useNavigate();

    return (
        <>
            <div
                style={{
                    height: "75vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Box>
                    <Text ta="center" fz={64}>
                        <IconMoodSad size="10rem" />
                    </Text>

                    <Text ta="center" fz={64}>
                        Opps, something went wrong
                    </Text>

                    <Text ta="center" c="dimmed" fz={28}>
                        Please try it later
                    </Text>

                    <Group justify="center" mt={32}>
                        <Button variant="default" onClick={() => navigate(-1)} size="lg">
                            Back Home
                        </Button>
                    </Group>
                </Box>
            </div>
        </>
    );
}

export default ErrorStatusComp;
