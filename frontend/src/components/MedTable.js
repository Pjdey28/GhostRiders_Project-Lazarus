import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper
} from "@mui/material";

export default function MedTable({ meds }) {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Scrambled</TableCell>
            <TableCell>Decrypted</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {meds.map((m, i) => (
            <TableRow key={i}>
              <TableCell>{m.scrambled_med}</TableCell>
              <TableCell>{m.decrypted_med}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}