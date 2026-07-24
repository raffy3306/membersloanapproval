<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class MembersTableSeeder extends Seeder
{
    public function run(): void
    {
        $sqlFile = database_path('seeders/data/members.sql');

        if (!is_file($sqlFile)) {
            throw new RuntimeException("Members seed SQL file not found: {$sqlFile}");
        }

        DB::statement("SET SESSION sql_mode = ''");
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        $handle = fopen($sqlFile, 'rb');

        if (!$handle) {
            throw new RuntimeException("Unable to open members seed SQL file: {$sqlFile}");
        }

        $statement = '';
        $collecting = false;

        DB::beginTransaction();

        try {
            while (($line = fgets($handle)) !== false) {
                if (!$collecting && str_starts_with($line, 'INSERT INTO `members`')) {
                    $collecting = true;
                    $statement = $line;
                    continue;
                }

                if (!$collecting) {
                    continue;
                }

                $statement .= $line;

                if (!str_ends_with(rtrim($line), ';')) {
                    continue;
                }

                DB::statement($this->toUpsertStatement($statement));

                $collecting = false;
                $statement = '';
            }

            if ($collecting) {
                throw new RuntimeException('Members seed SQL ended while reading an INSERT statement.');
            }

            DB::commit();

            $nextId = (int) DB::table('members')->max('id') + 1;
            DB::statement("ALTER TABLE members AUTO_INCREMENT = {$nextId}");
        } catch (Throwable $error) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            throw $error;
        } finally {
            fclose($handle);
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
        }
    }

    private function toUpsertStatement(string $statement): string
    {
        $statement = rtrim(rtrim($statement), ';');

        if (!preg_match('/^INSERT INTO `members` \(([^)]+)\) VALUES\s*(.+)$/s', $statement, $matches)) {
            throw new RuntimeException('Could not parse members seed INSERT statement.');
        }

        preg_match_all('/`([^`]+)`/', $matches[1], $columnMatches);

        $updates = collect($columnMatches[1])
            ->reject(fn (string $column) => in_array($column, ['id', 'cif_key'], true))
            ->map(fn (string $column) => "`{$column}` = VALUES(`{$column}`)")
            ->implode(', ');

        return "{$statement} ON DUPLICATE KEY UPDATE {$updates}";
    }
}
