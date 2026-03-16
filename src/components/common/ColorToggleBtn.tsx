import {
  ActionIcon,
  Box,
  Switch,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons-react";

interface ColorToggleBtnProps {
  mode?: "Switch" | "Button";
}

export default function ColorToggleBtn({ mode = "Switch" }: ColorToggleBtnProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <>
      {mode === "Switch" && (
        <Box>
          <Switch
            checked={colorScheme === "dark"}
            onChange={() => toggleColorScheme()}
            size="sm"
            onLabel={<IconSun color={theme.white} size="1.25rem" stroke={1.5} />}
            offLabel={<IconMoonStars color={theme.colors.gray[6]} size="1.25rem" stroke={1.5} />}
          />
        </Box>
      )}

      {mode === "Button" && (
        <Tooltip label="Toggle Theme">
          <ActionIcon
            onClick={() => toggleColorScheme()}
            variant="light"
            size="md"
            aria-label="Toggle color scheme"
            ml={8}
          >
            {colorScheme === "dark" ? (
              <IconSun color={theme.white} size="1.2rem" stroke={1.5} />
            ) : (
              <IconMoonStars color={theme.colors.gray[6]} size="1.2rem" stroke={1.5} />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );
}
