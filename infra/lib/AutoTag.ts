import * as pulumi from "@pulumi/pulumi";

export function registerAutoTags(autotags: Record<string, string>) {
  pulumi.runtime.registerStackTransformation((args) => {
    if ("tags" in args.props) {
      args.props["tags"] = { ...args.props["tags"], ...autotags };
      return { props: args.props, opts: args.opts };
    }
    return undefined;
  });
}
