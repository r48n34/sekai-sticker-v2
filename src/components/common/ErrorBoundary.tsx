import { Component, ErrorInfo, ReactNode } from "react";
import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
    const { t } = useTranslation();

    return (
        <Container size="sm" py="xl">
            <Paper withBorder radius="md" p="xl">
                <Stack gap="sm">
                    <Title order={2}>{t("Something went wrong")}</Title>
                    <Text c="dimmed">
                        {t(
                            "The page hit an unexpected error. Your saved work is still on this device.",
                        )}
                    </Text>
                    <Text c="dimmed" size="xs" style={{ wordBreak: "break-word" }}>
                        {error.message}
                    </Text>
                    <Button onClick={onRetry}>{t("Try again")}</Button>
                    <Button variant="default" onClick={() => window.location.reload()}>
                        {t("Reload page")}
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}

/**
 * Catches render errors from the lazy routes so a broken layer never leaves
 * the user with a blank page.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Unhandled UI error", error, info.componentStack);
    }

    handleRetry = () => {
        this.setState({ error: null });
    };

    render() {
        if (this.state.error) {
            return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
