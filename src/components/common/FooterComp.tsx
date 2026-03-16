import { Container, Group, Anchor, Text, Box } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconSticker } from "@tabler/icons-react";

import classes from "../../style/FooterSimple.module.css";
import ColorToggleBtn from "./ColorToggleBtn";

const links = [{ link: "/", label: "Home", format: "internal" }];

function FooterComp() {
  const navigate = useNavigate();

  const items = links.map((link) => (
    <Anchor<"a">
      c="dimmed"
      key={link.label}
      href={link.link}
      onClick={(event) => {
        event.preventDefault();
        if (link.format === "internal") {
          navigate(link.link);
        } else {
          !!window && window.open(link.link, "_blank");
        }
      }}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer} style={{ minHeight: "100%" }}>
      <Container className={classes.inner}>
        <Box>
          <Group>
            <IconSticker size={24} />
            <Text fw={300} fz={20} ml={-10}>
              Sekai Sticker V2
            </Text>
          </Group>

          <Text c="dimmed" fz={12} mt={4}>
            © {new Date().getFullYear()} Reemo Studio. All Rights Reserved.
          </Text>
        </Box>

        <Group className={classes.links}>
          {items}
          <ColorToggleBtn />
        </Group>
      </Container>
    </div>
  );
}

export default FooterComp;
