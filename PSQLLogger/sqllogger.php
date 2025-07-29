<?php

function parseLogEntries($filePath, $fileName, $slowQueryThreshold, &$parsedEntries = null)
{
    if ($parsedEntries === null) {
        $parsedEntries = [];
    }

    // Regular expressions
    $threadPattern = "/:\[(\d+)\]:/";
    $durationPattern = "/duration: (\d+(?:\.\d+)?)(?: ms)?/";
    $databaseNamePattern = "/:([^@:]+@[^:]+):/";
    $sqlQueryPattern = "/(?i)(SELECT |UPDATE |INSERT\sINTO |COPY |DELETE |ALTER\sTABLE |DROP\sTABLE ).*/";
    $newLinePattern = "/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC:\d+\.\d+\.\d+\.\d+\(\d+\):[a-z0-9@\-]+:\[\d+\]:/";

    $queryBuffer = [];
    $startTime = null;

    if (($file = fopen($filePath, "r")) !== false) {
        while (($line = fgets($file)) !== false) {
            // Use regular expressions to extract the thread ID, duration, and database name
            preg_match($threadPattern, $line, $threadMatch);
            preg_match($durationPattern, $line, $durationMatch);
            preg_match($databaseNamePattern, $line, $databaseMatch);
            preg_match($sqlQueryPattern, $line, $queryMatch);

            if ($durationMatch && $queryMatch) {
                $duration = floatval($durationMatch[1]);
                $query = $queryMatch[0];
                $startTime = explode(" UTC:", $line)[0];

                if ($duration < $slowQueryThreshold) {
                    continue;
                }

                $query = getCompleteQuery($query, $file, $newLinePattern);
                $queryHash = getQueryHash(implode("", $queryBuffer));

                if ($queryHash === null) {
                    continue;
                }

                // Create parsed query list
                $databaseName = $databaseMatch[1];

                $threadObj = [
                    "thread_id" => $threadMatch[1],
                    "duration" => $duration,
                    "database" => $databaseName,
                    "start_time" => $startTime,
                    "log_file" => $fileName
                ];

                if (!isset($parsedEntries[$queryHash])) {  // this is the first unique query
                    $parsedEntries[$queryHash] = [
                        "query" => $query,
                        "max_duration" => $duration,
                        "total_duration" => floatval($duration),
                        "threads" => [$threadObj],
                        "sql_statement_type" => $queryMatch[1]
                    ];
                } else {
                    if ($duration > $parsedEntries[$queryHash]["max_duration"]) {
                        $parsedEntries[$queryHash]["max_duration"] = $duration;
                    }
                    $parsedEntries[$queryHash]["threads"][] = $threadObj;
                    $parsedEntries[$queryHash]["total_duration"] += floatval($duration);
                }

                $queryBuffer = [];
            }
        }
        fclose($file);
    }

    return $parsedEntries;
}

function getCompleteQuery($query, $file, $newLinePattern)
{
    while (($nextLogEntry = fgets($file)) !== false) {
        if (!preg_match($newLinePattern, $nextLogEntry)) {
            $query .= $nextLogEntry;
        } else {
            fseek($file, -strlen($nextLogEntry), SEEK_CUR);
            break;
        }
    }
    return $query;
}

function getQueryHash($query)
{
    // Placeholder for actual query hash implementation
    return md5($query);
}

// Example usage:
$parsedEntries = parseLogEntries('/path/to/logfile.log', 'logfile.log', 100);
print_r($parsedEntries);
