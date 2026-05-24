import { useWindowScroll } from "@mantine/hooks";
import { Affix, Button, Transition } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons-react";

function ScrolltoTopComp() {
    const [scroll, scrollTo] = useWindowScroll();

    return (
        <>
            <Affix position={{ bottom: 20, right: 20 }}>
                <Transition transition="slide-up" mounted={scroll.y > 100}>
                    {(transitionStyles) => (
                        <Button
                            style={transitionStyles}
                            variant="light"
                            size="md"
                            radius="lg"
                            onClick={() => scrollTo({ y: 0 })}
                        >
                            <IconArrowUp />
                        </Button>
                    )}
                </Transition>
            </Affix>
        </>
    );
}

export default ScrolltoTopComp;
