import chalk from 'chalk';

class Logger {
  public static success(message: any, ...params: any[]) {
    console.log(chalk.greenBright(message), ...params);
  }
  public static info(message: any, ...params: any[]) {
    console.log(chalk.blueBright(message), ...params);
  }
  public static error(message: any, ...params: any[]) {
    console.log(chalk.redBright(message), ...params);
  }
}

export default Logger;
