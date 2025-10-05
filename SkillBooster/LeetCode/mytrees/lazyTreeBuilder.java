package mytrees;

import java.util.LinkedList;

public class lazyTreeBuilder  {
    public TreeNode builder(int[] values){
        if (values == null) return null;

        TreeNode root = new TreeNode(values[0]);
        LinkedList<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        int i = 1;

        while (i < values.length) {
            TreeNode current = queue.poll();
            if ( i < values.length) {
                current.left = new TreeNode(values[i++]);
                queue.add(current.left);
            }
            if ( i < values.length) {
                current.right = new TreeNode(values[i++]);
                queue.add(current.right);
            }
        }
    return root;
    }

    public static TreeNode buildBalancedBST(int[] values, int start, int end) {
        if (start > end) return null;

        int mid = (start + end) / 2;
        TreeNode node = new TreeNode(values[mid]);

        node.left = buildBalancedBST(values, start, mid - 1);
        node.right = buildBalancedBST(values, mid + 1, end);

        return node;
    }

    public static void printOrder(TreeNode node) {
        if (node == null) return;
        System.out.print(node.val + " ");
        printOrder(node.left);
        printOrder(node.right);
    }
}