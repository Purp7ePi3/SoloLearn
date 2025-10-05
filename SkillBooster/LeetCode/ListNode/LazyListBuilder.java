package ListNode;

public class LazyListBuilder {
    ListNode first;
    ListNode second;

    public LazyListBuilder(int[] v, int[] c) {
        if (v == null || c == null) return;
        
        // Build first list
        if (v.length > 0) {
            first = new ListNode(v[0]);
            ListNode current = first;
            for (int i = 1; i < v.length; i++) {
                current.next = new ListNode(v[i]);
                current = current.next;
            }
        }
        
        // Build second list
        if (c.length > 0) {
            second = new ListNode(c[0]);
            ListNode current = second;
            for (int i = 1; i < c.length; i++) {
                current.next = new ListNode(c[i]);
                current = current.next;
            }
        }
    }

    public static void listPrinter(ListNode list) {
        while (list != null) {
            System.out.print(list.val + " ");
            list = list.next;
        }
        System.out.println(); // Add newline at end
    }
    
    // Helper method to get the first list
    public ListNode getFirst() {
        return first;
    }
    
    // Helper method to get the second list
    public ListNode getSecond() {
        return second;
    }
    
    // Method to concatenate both lists
    public ListNode getConcatenated() {
        if (first == null) return second;
        if (second == null) return first;
        
        ListNode current = first;
        while (current.next != null) {
            current = current.next;
        }
        current.next = second;
        return first;
    }

    public static ListNode merge(ListNode a, ListNode b) {
        if (a == null && b == null) return null;
        if (a == null) return b;
        if (b == null) return a;

        ListNode dummy = new ListNode(0);
        ListNode current = dummy;

        while ( a != null && b != null) {
            if ( a.val < b.val){
                current.next = a;
                a = a.next;
            }else{
                current.next = b;
                b = b.next;
            }
            current = current.next;
        }
        if (a != null) {
            current.next = a;
        }

        if( b != null) {
            current.next = b;
        }
        return dummy.next;
    }
}
