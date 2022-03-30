import { program } from "commander";

program
    .version("1.0.0", "-v, --version")
    .usage("[OPTIONS]...")
    .option("--port <number>", "The port to run on")
    .parse(process.argv);

export default program.opts();
