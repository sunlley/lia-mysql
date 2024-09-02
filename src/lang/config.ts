import { AuthPlugin, SslOptions } from 'mysql2';

export class Config {


    constructor(options:any) {
        for (const optionsKey in options) {
            // @ts-ignore
            this[optionsKey]=options[optionsKey];
        }
    }

    /**
     * The milliseconds before a timeout occurs during the connection acquisition. This is slightly different from connectTimeout,
     * because acquiring a pool connection does not always involve making a connection. (Default: 10 seconds)
     */
    acquireTimeout?: number;

    /**
     * Determines the pool's action when no connections are available and the limit has been reached. If true, the pool will queue
     * the connection request and call it when one becomes available. If false, the pool will immediately call back with an error.
     * (Default: true)
     */
    waitForConnections?: boolean;

    /**
     * The maximum number of connections to create at once. (Default: 10)
     */
    connectionLimit?: number;

    /**
     * The minimum number of idle connections. (Default: 10)
     */
    maxIdle?: number;

    /**
     * The idle connections timeout, in milliseconds. (Default: 60000)
     */
    idleTimeout?: number;

    /**
     * The maximum number of connection requests the pool will queue before returning an error from getConnection. If set to 0, there
     * is no limit to the number of queued connection requests. (Default: 0)
     */
    queueLimit?: number;

    /**
     * Enable keep-alive on the socket.  It's disabled by default, but the
     * user can enable it and supply an initial delay.
     */
    enableKeepAlive?: boolean;

    /**
     * If keep-alive is enabled users can supply an initial delay.
     */
    keepAliveInitialDelay?: number;
    charsetNumber?: number;
    compress?: boolean;
    authSwitchHandler?: (data: any, callback: () => void) => any;
    connectAttributes?: { [param: string]: any };
    isServer?: boolean;
    maxPreparedStatements?: number;
    namedPlaceholders?: boolean;
    nestTables?: boolean | string;
    passwordSha1?: string;
    pool?: any;
    stream?: any;
    uri?: string;
    Promise?: any;
    authPlugins?: {
        [key: string]: AuthPlugin;
    };

    /**
     * DECIMAL and NEWDECIMAL types will be returned as numbers if this option is set to `true` ( default: `false`).
     */
    decimalNumbers?: boolean;

    /**
     * The MySQL user to authenticate as
     */
    user?: string;

    /**
     * The password of that MySQL user
     */
    password?: string;

    /**
     * Alias for the MySQL user password. Makes a bit more sense in a multifactor authentication setup (see
     * "password2" and "password3")
     */
    password1?: string;

    /**
     * 2nd factor authentication password. Mandatory when the authentication policy for the MySQL user account
     * requires an additional authentication method that needs a password.
     * https://dev.mysql.com/doc/refman/8.0/en/multifactor-authentication.html
     */
    password2?: string;

    /**
     * 3rd factor authentication password. Mandatory when the authentication policy for the MySQL user account
     * requires two additional authentication methods and the last one needs a password.
     * https://dev.mysql.com/doc/refman/8.0/en/multifactor-authentication.html
     */
    password3?: string;

    /**
     * Name of the database to use for this connection
     */
    database?: string;

    /**
     * The charset for the connection. This is called 'collation' in the SQL-level of MySQL (like utf8_general_ci).
     * If a SQL-level charset is specified (like utf8mb4) then the default collation for that charset is used.
     * (Default: 'UTF8_GENERAL_CI')
     */
    charset?: string;

    /**
     * The hostname of the database you are connecting to. (Default: localhost)
     */
    host?: string;

    /**
     * The port number to connect to. (Default: 3306)
     */
    port?: number;

    /**
     * The source IP address to use for TCP connection
     */
    localAddress?: string;

    /**
     * The path to a unix domain socket to connect to. When used host and port are ignored
     */
    socketPath?: string;

    /**
     * The timezone used to store local dates. (Default: 'local')
     */
    timezone?: string | 'local';

    /**
     * The milliseconds before a timeout occurs during the initial connection to the MySQL server. (Default: 10 seconds)
     */
    connectTimeout?: number;

    /**
     * Stringify objects instead of converting to values. (Default: 'false')
     */
    stringifyObjects?: boolean;

    /**
     * Allow connecting to MySQL instances that ask for the old (insecure) authentication method. (Default: false)
     */
    insecureAuth?: boolean;

    /**
     * Determines if column values should be converted to native JavaScript types. It is not recommended (and may go away / change in the future)
     * to disable type casting, but you can currently do so on either the connection or query level. (Default: true)
     *
     * You can also specify a function (field: any, next: () => void) => {} to do the type casting yourself.
     *
     * WARNING: YOU MUST INVOKE the parser using one of these three field functions in your custom typeCast callback. They can only be called once.
     *
     * field.string()
     * field.buffer()
     * field.geometry()
     *
     * are aliases for
     *
     * parser.parseLengthCodedString()
     * parser.parseLengthCodedBuffer()
     * parser.parseGeometryValue()
     *
     * You can find which field function you need to use by looking at: RowDataPacket.prototype._typeCast
     */
    typeCast?: boolean | ((field: any, next: () => void) => any);

    /**
     * A custom query format function
     */
    queryFormat?: (query: string, values: any) => void;

    /**
     * When dealing with big numbers (BIGINT and DECIMAL columns) in the database, you should enable this option
     * (Default: false)
     */
    supportBigNumbers?: boolean;

    /**
     * Enabling both supportBigNumbers and bigNumberStrings forces big numbers (BIGINT and DECIMAL columns) to be
     * always returned as JavaScript String objects (Default: false). Enabling supportBigNumbers but leaving
     * bigNumberStrings disabled will return big numbers as String objects only when they cannot be accurately
     * represented with [JavaScript Number objects](https://262.ecma-international.org/5.1/#sec-8.5)
     * (which happens when they exceed the [-2^53, +2^53] range), otherwise they will be returned as Number objects.
     * This option is ignored if supportBigNumbers is disabled.
     */
    bigNumberStrings?: boolean;

    /**
     * Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript Date
     * objects. Can be true/false or an array of type names to keep as strings.
     *
     * (Default: false)
     */
    dateStrings?: boolean | ('TIMESTAMP' | 'DATETIME' | 'DATE')[];

    /**
     * This will print all incoming and outgoing packets on stdout.
     * You can also restrict debugging to packet types by passing an array of types (strings) to debug;
     *
     * (Default: false)
     */
    debug?: any;

    /**
     * Generates stack traces on Error to include call site of library entrance ('long stack traces'). Slight
     * performance penalty for most calls. (Default: true)
     */
    trace?: boolean;

    /**
     * Allow multiple mysql statements per query. Be careful with this, it exposes you to SQL injection attacks. (Default: false)
     */
    multipleStatements?: boolean;

    /**
     * List of connection flags to use other than the default ones. It is also possible to blacklist default ones
     */
    flags?: string[];

    /**
     * object with ssl parameters or a string containing name of ssl profile
     */
    ssl?: string | SslOptions;


    /**
     * Return each row as an array, not as an object.
     * This is useful when you have duplicate column names.
     * This can also be set in the `QueryOption` object to be applied per-query.
     */
    rowsAsArray?: boolean

}
