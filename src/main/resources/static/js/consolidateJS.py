import os
import re

def read_file(filename):
    with open(filename, 'r') as file:
        return file.read()

def remove_imports_exports(content):
    # Remove import statements
    content = re.sub(r'^import.*?;\n', '', content, flags=re.MULTILINE)
    # Remove export statements
    content = re.sub(r'^export.*?;\n', '', content, flags=re.MULTILINE)
    # Remove default exports
    content = re.sub(r'export default .*?;', '', content)
    # Remove export statements within code blocks
    content = re.sub(r'\bexport\s+', '', content)
    return content

def create_manager_object(class_name, content):
    # Replace class with object
    content = re.sub(f'class {class_name}.*?{{', f'const {class_name} = {{', content, flags=re.DOTALL)
    # Replace methods with object methods
    content = re.sub(r'(\w+)\s*\((.*?)\)\s*{', r'\1: function(\2) {', content)
    # Remove constructor
    content = re.sub(r'constructor\s*\(.*?\)\s*{.*?}', '', content, flags=re.DOTALL)
    # Close the object
    content += '};'
    return content

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(current_dir, 'game.js')

    files_to_consolidate = [
        'game.js',
        'CombatManager.js',
        'PlayerManager.js',
        'QuestManager.js',
        'InventoryManager.js',
        'ShopManager.js',
        'UIManager.js'
    ]

    consolidated_content = "// Consolidated game.js\n\n"

    for filename in files_to_consolidate:
        file_path = os.path.join(current_dir, filename)
        if os.path.exists(file_path):
            content = read_file(file_path)
            content = remove_imports_exports(content)

            if filename != 'game.js':
                class_name = filename.replace('.js', '')
                content = create_manager_object(class_name, content)

            consolidated_content += f"// Contents from {filename}\n"
            consolidated_content += content + "\n\n"

    # Add initialization code at the end
    consolidated_content += """
// Initialization
function initializeGame() {
    playerId = localStorage.getItem('playerId');
    if (!playerId) {
        window.location.href = '/';
    } else {
        PlayerManager.updatePlayerInfo(playerId);
        PlayerManager.fetchAttributes(playerId).then(() => {
            QuestManager.updateQuestList(attributes);
            QuestManager.updateActivityList(attributes);
            ShopManager.updateShopList();
            ShopManager.updatePlayerShop(playerId);
        });
        InventoryManager.updateInvenotry(playerId);    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeGame);
document.getElementById('startCombatBtn').addEventListener('click', () => CombatManager.startCombat());
document.getElementById('spellSelect').addEventListener('change', () => CombatManager.handleSpellSelection());

// ... Add other necessary functions and event listeners ...
"""

    with open(output_file, 'w') as output:
        output.write(consolidated_content)

    print(f"Consolidated file created: {output_file}")

if __name__ == "__main__":
    main()