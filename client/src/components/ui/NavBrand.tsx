import { Flex, Text } from "@radix-ui/themes";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { BugIcon } from "lucide-react";

interface NavBrandProps extends LinkComponentProps {}

export function NavBrand({ ...props }: Readonly<NavBrandProps>) {
  return (
    <Link to="/" aria-label="Issue Tracker home" {...props}>
      <Flex gapX={"2"}>
        <BugIcon color="red" />
        <Text as="span" color="red">
          IssueTracker
        </Text>
      </Flex>
    </Link>
  );
}
