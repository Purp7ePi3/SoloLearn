import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import mytrees.TreeNode;
import mytrees.lazyTreeBuilder;
import ListNode.LazyListBuilder;
import ListNode.ListNode;
import ZigZagConversion.ZigzagConversion;

class Solution {
    public static void main(String[] args) {
        int[] arr ={5,4,8,11,(Integer) null,13,4,7,2,(Integer) null,(Integer) null,(Integer) null,1};
        String s = "babad";
        // String strings = "Hello world lupo";
        // int[] Arrayss = {1,2,3,4,5,2,7,8,9,10};
        // System.out.println(lengthOfLastWord(s));
        // System.out.println(plusOne(Arrayss));
        // System.out.println(firstMissingPositive(arr));
        // System.out.println(findDuplicate(arr));
        // System.out.println(threeSum(arr));
        lazyTreeBuilder prova1 = new lazyTreeBuilder();
        TreeNode diocane = prova1.builder(arr);
        // TreeNode root = lazyTreeBuilder.buildBalancedBST(arr, 0, arr.length -1);
        // lazyTreeBuilder.printOrder(root);
        // System.out.println("\n");
        // lazyTreeBuilder.printOrder(diocane);
        // LazyListBuilder builder = new LazyListBuilder(new int[]{1,2,3}, new int[]{4,5,6});
        // ListNode res = addTwoNumbers(builder.getFirst(), builder.getSecond());
        // LazyListBuilder.listPrinter(res);
        // LazyListBuilder.listPrinter(LazyListBuilder.merge(builder.getFirst(), builder.getSecond()));
        // System.out.println(maxArea(arr));
        // ZigzagConversion zc = new ZigzagConversion();
        // String result = zc.convert("PAYPALISHIRING", 3);
        // System.out.println(result); // Output: PAHNAPLSIIGYIR 
        // System.out.println(threeSumClosest(arr, 1));

        // String[] strs = {"flower","flow","flight"};
        // System.out.println(longestCommonPrefix(strs)); // fl

        // ArrayList<Integer> memo = new ArrayList<>();
        // System.out.println(climbStairs(3));

        // System.out.println(letterCombinations("23"));

        // System.out.println(longestPalindrome(strings));

        // int[][] edges = {{1,2},{2,3},{4,2}};
        // System.out.print(findCenter(edges));
        System.out.println();
    }

    private static int lengthOfLastWord(String s) {
        return Stream.of(s.trim().split(" "))
                    .reduce((_, second) -> second)
                    .map(String::length)
                    .orElse(0);
    }

    private static int[] plusOne(int[] digits) {
        for (int i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }
        digits[i] = 0;
    }
    int[] result = new int[digits.length + 1];
        result[0] = 1;
        return result;
    }

    // public static int firstMissingPositive(int[] nums) {
    //     int n = nums.length;
    //         for (int i = 0; i < n; i++) {
    //             while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
    //                 int correctPos = nums[i] - 1;
    //                 int temp = nums[i];
    //                 nums[i] = nums[correctPos];
    //                 nums[correctPos] = temp;
    //             }
    //         }
    //         for (int i = 0; i < n; i++) {
    //             if (nums[i] != i + 1) {
    //                 return i + 1;
    //             }
    //         }        
    //         return n + 1;
    // }

    public static int findDuplicate(int[] nums) {
        // Set<Integer> dupe = new HashSet<>();
        // for (Integer integer : nums) {
        //     if(dupe.contains(integer)){
        //         return integer;
        //     }
        //     dupe.add(integer);
        //    }
           
        // return 0;

        // FASTER SOLUTION
        int n = nums.length;
        boolean[] seen = new boolean[n];

        for(int i = 0; i < nums.length; i++) {
            if(seen[nums[i]]) return nums[i];
            else seen[nums[i]] = true;
        }

        return -1;
    }

    public static List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        int n = nums.length;
        Arrays.sort(nums);
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) {
                continue;
            }
            
            int left = i + 1;
            int right = n - 1;
        
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));                
                    while (left < right && nums[left] == nums[left + 1]) {
                        left++;
                    }
                    while (left < right && nums[right] == nums[right - 1]) {
                        right--;
                    }
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++; 
                } else {
                    right--;
                }
            }
        }
        
        return result;
    }
    
    public static boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null) return false;
        if (p.val != q.val) return false;

        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }

    public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        if (l1 == null && l2 == null) return null;
        if (l1 == null) return l2;
        if (l2 == null) return l1;
        
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        int carry = 0;
        
        while (l1 != null || l2 != null || carry > 0) {
            int val1 = (l1 != null) ? l1.val : 0;
            int val2 = (l2 != null) ? l2.val : 0;
            
            int sum = val1 + val2 + carry;
            carry = sum / 10;
            int digit = sum % 10;
            
            current.next = new ListNode(digit);
            current = current.next;            
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        
        return dummy.next; 
    }

    // {1,8,6,2,5,4,8,3,7}
    public static int maxArea(int[] height) {
        int left = 0;
        int right = height.length -1;
        int area = 0;
           
        while (left < right) {
            int h = Math.min(height[left], height[right]);
            int w = right - left;
            area = Math.max(area, h*w);

            while (left < right && height[left] <= h) left++;
            while (left < right && height[right] <= h) right--;         
        }
        return area;
    }

    public static int threeSumClosest(int[] nums, int target) {
        Arrays.sort(nums);
        int closestSum = nums[0] + nums[1] + nums[2];

        for (int i = 0; i < nums.length - 2; i++) {
            int left = i + 1;
            int right = nums.length - 1;

            while (left < right) {
                int currentSum = nums[i] + nums[left] + nums[right];

                if (Math.abs(currentSum - target) < Math.abs(closestSum - target)) {
                    closestSum = currentSum;
                }

                if (currentSum < target) {
                    left++;
                } else if (currentSum > target) {
                    right--;
                } else {
                    return target;
                }
            }
        }
        return closestSum;
    }

    public static String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) return "";

        String prefix = strs[0];
        if (prefix == null) return "";

        for (int i = 1; i < strs.length; i++) {
            String s = strs[i];
            if (s == null) return "";
            while (!s.startsWith(prefix)) {
                if (prefix.length() == 0) return "";
                prefix = prefix.substring(0, prefix.length() - 1);
            }
        }
        return prefix;
    }


    public static int climbStairs(int n) {
       int memo[] = new int[n + 1];
       return climb(n, memo);
    }

    public static int climb(int n, int[] memo) {
        if (n <= 2) return n;
        if( memo[n] != 0) return memo[n];
        memo[n] = climb(n-1, memo) + climb(n-2, memo);
        return memo[n];
    }

    public static Map<Integer, String> buildDic(  Map<Integer, String> dict) {
        dict.put(2, "abc");
        dict.put(3, "def");
        dict.put(4, "ghi");
        dict.put(5, "jkl");
        dict.put(6, "mno");
        dict.put(7, "pqrs");
        dict.put(8, "tuv");
        dict.put(9, "wxyz");
        return dict;
    }

    private static void backtrack(List<String> result, Map<Integer, String> dict,
                                String digits, int index, StringBuilder current) {
        if (index == digits.length()) {
            result.add(current.toString());
            return;
        }

        String letters = dict.get(digits.charAt(index) - '0');
        for (char c : letters.toCharArray()) {
            current.append(c);
            backtrack(result, dict, digits, index + 1, current);
            current.deleteCharAt(current.length() - 1);
        }
    }

    public static List<String> letterCombinations(String digits) {
        if (digits == null || digits.isEmpty()) return new ArrayList<>();

        Map<Integer,String> dict = new HashMap<>();
        buildDic(dict);

        List<String> result = new ArrayList<>();

        backtrack(result, dict, digits, 0, new StringBuilder());

        return result;

    }


    public static int findCenter(int[][] edges) {
        if (edges[0][0] == edges[1][0] || edges[0][0] == edges[1][1]) {
            return edges[0][0];
        } else {
            return edges[0][1];
        }
    }


    public static String intToRoman(int num) {
        Map<String, Integer> map = new LinkedHashMap<>();
        map.put("M", 1000); map.put("CM", 900);
        map.put("D", 500);  map.put("CD", 400);
        map.put("C", 100);  map.put("XC", 90);
        map.put("L", 50);   map.put("XL", 40);
        map.put("X", 10);   map.put("IX", 9);
        map.put("V", 5);    map.put("IV", 4);
        map.put("I", 1);

        StringBuilder sb = new StringBuilder();
        int acc = num;

        for (var e : map.entrySet()) {
            while (acc >= e.getValue()) {
                sb.append(e.getKey());
                acc -= e.getValue();
            }
        }
        return sb.toString();
    }

   
    public static boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) return false;

        if (root.left == null && root.right == null) {
            return targetSum == root.val;
        }

        int remainder = targetSum - root.val;
        return hasPathSum(root.left, remainder) || hasPathSum(root.right, remainder);
    }

}