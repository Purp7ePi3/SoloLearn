package ZigZagConversion;

public class ZigzagConversion {
    public String convert(String s, int numRow){
        if (numRow == 1 || numRow >= s.length()){
            return s;
        }

        StringBuilder[] rows = new StringBuilder[Math.min(numRow, s.length())];
        for (int i = 0; i < rows.length; i++){
            rows[i] = new StringBuilder();
        }

        int curRow = 0;
        boolean goDown = false;

        for(char c : s.toCharArray()){
            rows[curRow].append(c);

            if(curRow == 0 || curRow == numRow -1) {
                goDown = !goDown;
            }
            curRow += goDown ? 1 : -1;
        }
        StringBuilder res = new StringBuilder();
        for(StringBuilder row : rows) {
            res.append(row);
        }
        return res.toString();
    }
}
