import javax.swing.*;
import java.awt.*;
import java.util.*;
import java.util.List;
import javax.swing.Timer;

public class MinesweeperAI extends JFrame {
    private static final int RIGHE = 9;
    private static final int COLONNE = 9;
    private static final int NUM_MINE = 10;
    
    private JButton[][] bottoni;
    private boolean[][] mine;
    private boolean[][] rivelate;
    private boolean[][] bandiere;
    private int[][] numeriRivelati;
    private int celleRimanenti;
    private boolean giocoFinito;
    private JLabel labelMine;
    private JLabel labelStato;
    private JLabel labelMosse;
    private Timer aiTimer;
    private int mosseEffettuate;
    private Random random;
    
    public MinesweeperAI() {
        setTitle("Minesweeper AI - Gioca da Solo");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        Dimension screenDimension = Toolkit.getDefaultToolkit().getScreenSize();
        int h = (int)screenDimension.getHeight();
        int w = (int)screenDimension.getWidth();
        
        setSize(Math.min(800, w-100), Math.min(900, h-100));
        setResizable(false);
        
        random = new Random();
        inizializzaGioco();
        creaInterfaccia();
        piazzaMine();
        
        setLocationRelativeTo(null);
        setVisible(true);
        
        // Avvia l'AI dopo un breve ritardo
        Timer startTimer = new Timer(1000, e -> iniziaAI());
        startTimer.setRepeats(false);
        startTimer.start();
    }
    
    private void inizializzaGioco() {
        bottoni = new JButton[RIGHE][COLONNE];
        mine = new boolean[RIGHE][COLONNE];
        rivelate = new boolean[RIGHE][COLONNE];
        bandiere = new boolean[RIGHE][COLONNE];
        numeriRivelati = new int[RIGHE][COLONNE];
        celleRimanenti = RIGHE * COLONNE - NUM_MINE;
        giocoFinito = false;
        mosseEffettuate = 0;
        
        // Inizializza numeriRivelati a -1 (non rivelato)
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                numeriRivelati[i][j] = -1;
            }
        }
    }
    
    private void creaInterfaccia() {
        setLayout(new BorderLayout());
        
        // Pannello superiore con informazioni
        JPanel pannelloSuperiore = new JPanel(new FlowLayout());
        labelMine = new JLabel("Mine: " + NUM_MINE);
        labelStato = new JLabel("AI sta pensando...");
        labelMosse = new JLabel("Mosse: 0");
        JButton bottoneNuovo = new JButton("Nuovo Gioco");
        JButton bottonePausa = new JButton("Pausa/Riprendi");
        
        bottoneNuovo.addActionListener(e -> nuovoGioco());
        bottonePausa.addActionListener(e -> pausaRiprendi());
        
        pannelloSuperiore.add(labelMine);
        pannelloSuperiore.add(Box.createHorizontalStrut(10));
        pannelloSuperiore.add(labelStato);
        pannelloSuperiore.add(Box.createHorizontalStrut(10));
        pannelloSuperiore.add(labelMosse);
        pannelloSuperiore.add(Box.createHorizontalStrut(10));
        pannelloSuperiore.add(bottoneNuovo);
        pannelloSuperiore.add(bottonePausa);
        
        add(pannelloSuperiore, BorderLayout.NORTH);
        
        // Griglia di gioco
        JPanel grigliaPannello = new JPanel(new GridLayout(RIGHE, COLONNE));
        
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                bottoni[i][j] = new JButton();
                bottoni[i][j].setPreferredSize(new Dimension(35, 35));
                bottoni[i][j].setFont(new Font("Arial", Font.BOLD, 14));
                bottoni[i][j].setMargin(new Insets(0, 0, 0, 0));
                bottoni[i][j].setFocusPainted(false);
                bottoni[i][j].setEnabled(true);
                
                grigliaPannello.add(bottoni[i][j]);
            }
        }
        
        add(grigliaPannello, BorderLayout.CENTER);
    }
    
    private void piazzaMine() {
        int minepiazzate = 0;
        
        while (minepiazzate < NUM_MINE) {
            int riga = random.nextInt(RIGHE);
            int colonna = random.nextInt(COLONNE);
            
            if (!mine[riga][colonna]) {
                mine[riga][colonna] = true;
                minepiazzate++;
            }
        }
    }
    
    private void iniziaAI() {
        if (aiTimer != null) {
            aiTimer.stop();
        }
        
        // Timer per le mosse dell'AI (una mossa ogni 800ms)
        aiTimer = new Timer(800, e -> {
            if (!giocoFinito) {
                effettuaMossaAI();
            } else {
                ((Timer)e.getSource()).stop();
            }
        });
        aiTimer.start();
        
        // Prima mossa casuale al centro
        rivelaCella(RIGHE/2, COLONNE/2);
    }
    
    private void effettuaMossaAI() {
        mosseEffettuate++;
        labelMosse.setText("Mosse: " + mosseEffettuate);
        
        // Strategia 1: Trova celle sicure da rivelare
        Point cellaSicura = trovaCellaSicura();
        if (cellaSicura != null) {
            labelStato.setText("AI: Trovata cella sicura!");
            rivelaCella(cellaSicura.x, cellaSicura.y);
            return;
        }
        
        // Strategia 2: Trova mine certe e metti bandiere
        Point minaCerta = trovaMinaCerta();
        if (minaCerta != null) {
            labelStato.setText("AI: Trovata mina certa!");
            piazzaBandiera(minaCerta.x, minaCerta.y);
            return;
        }
        
        // Strategia 3: Analisi probabilistica
        Point cellaFortunata = scegliCellaProbabilistica();
        if (cellaFortunata != null) {
            labelStato.setText("AI: Tentando la fortuna...");
            rivelaCella(cellaFortunata.x, cellaFortunata.y);
            return;
        }
        
        // Strategia 4: Mossa casuale (ultima risorsa)
        Point cellaCasuale = scegliCellaCasuale();
        if (cellaCasuale != null) {
            labelStato.setText("AI: Mossa casuale!");
            rivelaCella(cellaCasuale.x, cellaCasuale.y);
        }
    }
    
    private Point trovaCellaSicura() {
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                if (rivelate[i][j] && numeriRivelati[i][j] > 0) {
                    List<Point> celleVicineNonRivelate = getCelleVicineNonRivelate(i, j);
                    List<Point> bandiereVicine = getBandiereVicine(i, j);
                    
                    // Se il numero di bandiere vicine è uguale al numero della cella,
                    // tutte le altre celle vicine sono sicure
                    if (bandiereVicine.size() == numeriRivelati[i][j]) {
                        for (Point cella : celleVicineNonRivelate) {
                            if (!bandiere[cella.x][cella.y]) {
                                return cella;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
    
    private Point trovaMinaCerta() {
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                if (rivelate[i][j] && numeriRivelati[i][j] > 0) {
                    List<Point> celleVicineNonRivelate = getCelleVicineNonRivelate(i, j);
                    List<Point> bandiereVicine = getBandiereVicine(i, j);
                    
                    // Se il numero di celle non rivelate + bandiere è uguale al numero della cella,
                    // tutte le celle non rivelate sono mine
                    if (celleVicineNonRivelate.size() + bandiereVicine.size() == numeriRivelati[i][j]) {
                        for (Point cella : celleVicineNonRivelate) {
                            if (!bandiere[cella.x][cella.y]) {
                                return cella;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
    
    private Point scegliCellaProbabilistica() {
        // Semplice euristica: scegli la cella con meno probabilità di essere una mina
        Point migliore = null;
        double minProbabilita = 1.0;
        
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                if (!rivelate[i][j] && !bandiere[i][j]) {
                    double probabilita = calcolaProbabilitaMina(i, j);
                    if (probabilita < minProbabilita) {
                        minProbabilita = probabilita;
                        migliore = new Point(i, j);
                    }
                }
            }
        }
        
        return migliore;
    }
    
    private double calcolaProbabilitaMina(int riga, int colonna) {
        // Calcola la probabilità che questa cella sia una mina
        // basandosi sui numeri delle celle vicine rivelate
        int sommaNumeri = 0;
        int celleVicineRivelate = 0;
        
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                int r = riga + i;
                int c = colonna + j;
                
                if (r >= 0 && r < RIGHE && c >= 0 && c < COLONNE && 
                    rivelate[r][c] && numeriRivelati[r][c] > 0) {
                    sommaNumeri += numeriRivelati[r][c];
                    celleVicineRivelate++;
                }
            }
        }
        
        if (celleVicineRivelate == 0) {
            return (double) NUM_MINE / (RIGHE * COLONNE); // Probabilità generale
        }
        
        return Math.min(1.0, (double) sommaNumeri / (celleVicineRivelate * 8));
    }
    
    private Point scegliCellaCasuale() {
        List<Point> celleDisponibili = new ArrayList<>();
        
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                if (!rivelate[i][j] && !bandiere[i][j]) {
                    celleDisponibili.add(new Point(i, j));
                }
            }
        }
        
        if (!celleDisponibili.isEmpty()) {
            return celleDisponibili.get(random.nextInt(celleDisponibili.size()));
        }
        
        return null;
    }
    
    private List<Point> getCelleVicineNonRivelate(int riga, int colonna) {
        List<Point> celle = new ArrayList<>();
        
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                int r = riga + i;
                int c = colonna + j;
                
                if (r >= 0 && r < RIGHE && c >= 0 && c < COLONNE && 
                    !rivelate[r][c] && (i != 0 || j != 0)) {
                    celle.add(new Point(r, c));
                }
            }
        }
        
        return celle;
    }
    
    private List<Point> getBandiereVicine(int riga, int colonna) {
        List<Point> bandiereList = new ArrayList<>();
        
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                int r = riga + i;
                int c = colonna + j;
                
                if (r >= 0 && r < RIGHE && c >= 0 && c < COLONNE && 
                    bandiere[r][c] && (i != 0 || j != 0)) {
                    bandiereList.add(new Point(r, c));
                }
            }
        }
        
        return bandiereList;
    }
    
    private void rivelaCella(int riga, int colonna) {
        if (rivelate[riga][colonna] || bandiere[riga][colonna] || giocoFinito) {
            return;
        }
        
        rivelate[riga][colonna] = true;
        
        if (mine[riga][colonna]) {
            // L'AI ha colpito una mina!
            bottoni[riga][colonna].setText("BOMB");
            bottoni[riga][colonna].setBackground(Color.RED);
            giocoPerso();
        } else {
            int mineVicine = contaMineVicine(riga, colonna);
            numeriRivelati[riga][colonna] = mineVicine;
            
            bottoni[riga][colonna].setBackground(Color.LIGHT_GRAY);
            
            if (mineVicine > 0) {
                bottoni[riga][colonna].setText(String.valueOf(mineVicine));
                bottoni[riga][colonna].setForeground(getColoreNumero(mineVicine));
                bottoni[riga][colonna].setFont(new Font("Arial", Font.BOLD, 14));
            } else {
                bottoni[riga][colonna].setText("");
                // Se non ci sono mine vicine, rivela automaticamente le celle adiacenti
                for (int i = -1; i <= 1; i++) {
                    for (int j = -1; j <= 1; j++) {
                        int nuovaRiga = riga + i;
                        int nuovaColonna = colonna + j;
                        
                        if (nuovaRiga >= 0 && nuovaRiga < RIGHE && 
                            nuovaColonna >= 0 && nuovaColonna < COLONNE) {
                            rivelaCella(nuovaRiga, nuovaColonna);
                        }
                    }
                }
            }
            
            celleRimanenti--;
            
            // Controlla se l'AI ha vinto
            if (celleRimanenti == 0) {
                giocoVinto();
            }
        }
    }
    
    private void piazzaBandiera(int riga, int colonna) {
        if (rivelate[riga][colonna] || bandiere[riga][colonna]) {
            return;
        }
        
        bandiere[riga][colonna] = true;
        bottoni[riga][colonna].setText("FLAG");
        bottoni[riga][colonna].setBackground(Color.YELLOW);
        
        aggiornaContatoreMine();
    }
    
    private int contaMineVicine(int riga, int colonna) {
        int conta = 0;
        
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                int nuovaRiga = riga + i;
                int nuovaColonna = colonna + j;
                
                if (nuovaRiga >= 0 && nuovaRiga < RIGHE && 
                    nuovaColonna >= 0 && nuovaColonna < COLONNE && 
                    mine[nuovaRiga][nuovaColonna]) {
                    conta++;
                }
            }
        }
        
        return conta;
    }
    
    private Color getColoreNumero(int numero) {
        switch (numero) {
            case 1: return Color.BLUE;
            case 2: return Color.GREEN;
            case 3: return Color.RED;
            case 4: return Color.MAGENTA;
            case 5: return Color.ORANGE;
            case 6: return Color.CYAN;
            case 7: return Color.BLACK;
            case 8: return Color.DARK_GRAY;
            default: return Color.BLACK;
        }
    }
    
    private void aggiornaContatoreMine() {
        int bandierePiazzate = 0;
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                if (bandiere[i][j]) {
                    bandierePiazzate++;
                }
            }
        }
        labelMine.setText("Mine: " + (NUM_MINE - bandierePiazzate));
    }
    
    private void giocoPerso() {
        giocoFinito = true;
        labelStato.setText("AI ha perso! (" + mosseEffettuate + " mosse)");
        labelStato.setForeground(Color.RED);
        
        if (aiTimer != null) {
            aiTimer.stop();
        }
        
        // Mostra tutte le mine
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                if (mine[i][j] && !bandiere[i][j]) {
                    bottoni[i][j].setText("BOMB");
                    bottoni[i][j].setBackground(Color.RED);
                }
            }
        }
    }
    
    private void giocoVinto() {
        giocoFinito = true;
        labelStato.setText("AI ha vinto!(" + mosseEffettuate + " mosse)");
        labelStato.setForeground(Color.GREEN);
        
        if (aiTimer != null) {
            aiTimer.stop();
        }
        
        // Piazza automaticamente le bandiere sulle mine rimanenti
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                if (mine[i][j] && !bandiere[i][j]) {
                    bottoni[i][j].setText("FLAG");
                    bottoni[i][j].setBackground(Color.YELLOW);
                }
            }
        }
        
        labelMine.setText("Mine: 0");
    }
    
    private void pausaRiprendi() {
        if (aiTimer != null) {
            if (aiTimer.isRunning()) {
                aiTimer.stop();
                labelStato.setText("AI in pausa");
            } else if (!giocoFinito) {
                aiTimer.start();
                labelStato.setText("AI sta giocando...");
            }
        }
    }
    
    private void nuovoGioco() {
        if (aiTimer != null) {
            aiTimer.stop();
        }
        
        // Resetta tutto
        for (int i = 0; i < RIGHE; i++) {
            for (int j = 0; j < COLONNE; j++) {
                bottoni[i][j].setText("");
                bottoni[i][j].setBackground(null);
                mine[i][j] = false;
                rivelate[i][j] = false;
                bandiere[i][j] = false;
                numeriRivelati[i][j] = -1;
            }
        }
        
        celleRimanenti = RIGHE * COLONNE - NUM_MINE;
        giocoFinito = false;
        mosseEffettuate = 0;
        labelStato.setText("AI sta pensando...");
        labelStato.setForeground(Color.BLACK);
        labelMine.setText("Mine: " + NUM_MINE);
        labelMosse.setText("Mosse: 0");
        
        piazzaMine();
        
        // Riavvia l'AI
        Timer startTimer = new Timer(1000, e -> iniziaAI());
        startTimer.setRepeats(false);
        startTimer.start();
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new MinesweeperAI());
    }
}