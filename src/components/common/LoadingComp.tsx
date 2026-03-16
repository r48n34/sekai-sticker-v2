import { Loader, Group } from "@mantine/core";

function LoadingComp() {
  return (
    <>
      <Group justify="center" mt={12}>
        <Loader color="blue" type="bars" size="lg" />
      </Group>
    </>
  );
}

export default LoadingComp;
