import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.Random;

public class Hangman extends JFrame {
    private String[] words = {"դպրոց", "դասարան", "աշակերտ", "ուսուցիչ", "մատիտ", "ռետին", "տաշելիք", "գրչատուփ", "կցիչ", "խէժ", "գիրք", "ջուր", "տետրակ", "գրատախտակ", "թղթապանակ", "վերամուտ", "կարկին", "պայուսակ", "հաց", "պանիր", "մածուն", "ճաշ", "աղցան", "դանակ", "դգալ", "պատառաքաղ", "գաւաթ", "պնակ", "թաշկինակ", "ճաշասրահ", "լոլիկ", "վարունք", "խնձոր", "խաղող", "օշարակ", "աշուն", "տերեւ", "ենտանիք", "մայր", "հայր", "քոյր", "եղբայր", "մօրաքոյր", "հօրաքոյր", "մօրեղբայր", "հօրեղբայր"};
    private String wordToGuess;
    private StringBuilder displayWord;
    private int wrongGuesses;
    private JTextField displayField;
    private JTextField usedLettersField;
    private JTextArea hangmanText;

    public Hangman() {
        setTitle("Կախաղան");
        setSize(400, 400);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new FlowLayout());

        displayField = new JTextField(20);
        displayField.setEditable(false);
        add(displayField);

        usedLettersField = new JTextField(20);
        usedLettersField.setEditable(false);
        add(usedLettersField);

        hangmanText = new JTextArea(5, 20);
        hangmanText.setEditable(false);
        hangmanText.setLineWrap(true);
        hangmanText.setWrapStyleWord(true);
        add(hangmanText);

        JPanel buttonPanel = new JPanel();
        for (char letter = 'ա'; letter <= 'ֆ'; letter++) {
            JButton button = new JButton(String.valueOf(letter));
            button.addActionListener(new LetterButtonListener());
            buttonPanel.add(button);
        }
        add(buttonPanel);

        JButton resetButton = new JButton("Վերսկսէ");
        resetButton.addActionListener(e -> resetGame());
        add(resetButton);

        selectWord();
        updateDisplay();
    }

    private void selectWord() {
        Random rand = new Random();
        wordToGuess = words[rand.nextInt(words.length)];
        displayWord = new StringBuilder("-").append("-".repeat(wordToGuess.length() - 1));
        wrongGuesses = 0;
    }

    private void updateDisplay() {
        displayField.setText(displayWord.toString());
        usedLettersField.setText(usedLettersField.getText());
        hangmanText.setText(getHangmanText());
        if (wrongGuesses == 10) {
            JOptionPane.showMessageDialog(this, "Պարտուեցար");
            resetGame();
        }
    }

    private String getHangmanText() {
        switch (wrongGuesses) {
            case 0: return "  O  ";
            case 1: return "  O  ";
            case 2: return "  O  \n  |  ";
            case 3: return "  O  \n /|  ";
            case 4: return "  O  \n /|\\ ";
            case 5: return "  O  \n /|  ";
            case 6: return "  O  \n /|  \n / \\ ";
            case 7: return "  O  \n /|\\n / \\ ";
            case 8: return "  O  \n /|\\n / \\nGame Over!";
            case 9: return "  O  \n /|\\n / \\nLast Chance!";
            case 10: return "  O  \n /|\\n / \\nGame Over!";
            default: return "\n";
        }
    }

    private class LetterButtonListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            JButton source = (JButton) e.getSource();
            String letter = source.getText();
            if (wordToGuess.contains(letter)) {
                for (int i = 0; i < wordToGuess.length(); i++) {
                    if (wordToGuess.charAt(i) == letter.charAt(0)) {
                        displayWord.setCharAt(i, letter.charAt(0));
                    }
                }
                if (displayWord.toString().equals(wordToGuess)) {
                    JOptionPane.showMessageDialog(Hangman.this, "Ապրիս յաղթեցիր");
                    resetGame();
                }
            } else {
                wrongGuesses++;
            }
            updateDisplay();
        }
    }

    private void resetGame() {
        selectWord();
        updateDisplay();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            Hangman game = new Hangman();
            game.setVisible(true);
        });
    }
}
