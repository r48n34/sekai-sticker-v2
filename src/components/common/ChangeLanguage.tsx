import { Menu, ActionIcon, Tooltip } from "@mantine/core";
import { IconLanguage, IconStar, IconStarFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";

function ChangeLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useLocalStorage({
    key: "languages-sekai",
    defaultValue: "en",
  });

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label="Languages">
          <ActionIcon variant="light" aria-label="Settings">
            <IconLanguage style={{ width: "70%", height: "70%" }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Languages</Menu.Label>
        {[
          { lang: "en", label: "English" },
          { lang: "zh-CN", label: "中文 (简体)" },
          { lang: "zh-TW", label: "中文 (繁體)" },
          { lang: "ja", label: "日本語" },
        ].map((v) => (
          <Menu.Item
            key={v.lang}
            onClick={() => setLanguage(v.lang)}
            leftSection={
              language === v.lang ? <IconStarFilled size={12} /> : <IconStar size={12} />
            }
          >
            {v.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

export default ChangeLanguage;
