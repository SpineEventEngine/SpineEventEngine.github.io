"""Scans a directory with Java files recursively and removes the `final` modifier from all local
variables in the Java code.

Changed files are re-written in-place.

The changed code should still be reviewed manually, as there are corner cases which cannot be
parsed normally. For such cases the script tends to generate more false negatives than false
positives.

It will probably be necessary to auto-format the code after applying this script, as it doesn't do
any formatting, just removing the `final` keyword.

Prerequisites:

    1) Python 2.7

Usage:

    python remove_finals.py *directory path*

    where the *directory path* is an absolute path to the directory with Java files you want to
    refactor, for example: "/home/user/SpineEventEngine/core-java".
"""

import argparse
import os
import re


def main():
    parser = argparse.ArgumentParser(
        description='Scan directory with Java code and remove `final` modifier from all '
                    'local variables.')
    parser.add_argument('directory_path', type=str, help='an absolute path to the directory')
    args = parser.parse_args()
    scan_dir_and_remove_finals(args.directory_path)


def scan_dir_and_remove_finals(dir_path):
    """Scans a directory with the Java files and removes the `final` modifier from all local
    variables in the Java code.

    Files are changed in-place.

    Args:
        dir_path: the absolute path to the directory.
    """
    for root, dirs, files in os.walk(dir_path):
        for file_name in files:
            if file_name.endswith('.java'):
                file_path = os.path.join(root, file_name)
                print 'Processing file %s' % file_path
                scan_and_remove_finals(file_path)


def scan_and_remove_finals(file_path):
    """Scans a Java file and removes `final` modifier from local variables in the Java code.

    The changed file content is saved to the file in-place.

    Args:
        file_path: the absolute path to the file.
    """
    if not (os.path.isfile(file_path) and os.access(file_path, os.W_OK)):
        print 'Skipping file %s as it cannot be read' % file_path
        return

    file_content = _read_file_contents(file_path)
    if file_content is not None:
        new_file_content = _remove_finals(file_content)
        _write_updated_contents(file_path, new_file_content)


def _read_file_contents(file_path):
    """Reads the file content into the list of strings line-by-line.

    In case of an error prints a log message and returns `None`, and does not propagate the
    exception, so the function can safely read large bulks of files one-by-one.

    Args:
        file_path: the absolute path to the file.

    Returns:
        list: the file content, i.e. the list of file lines.
    """
    try:
        with open(file_path, 'r') as f:
            file_content = f.readlines()
            return file_content
    except EnvironmentError:
        print 'Cannot open/access file %s for reading', file_path


def _remove_finals(file_content):
    """Examines the file content and removes the `final` modifier from all local variables.

    Assumes that the file content is the Java code.

    Args:
        file_content: the content of the file, i.e. the list of file lines.

    Returns:
        list: the new file content with the `final` keyword removed where necessary.
    """
    new_content = []
    for index, line in enumerate(file_content):
        new_line = _remove_final_where_necessary(line, file_content, index)
        new_content.append(new_line)
    return new_content


def _write_updated_contents(file_path, content):
    """Writes the new content into the specified file.

    File's old content is overridden.

    In case of an error prints a log message and does nothing, and does not propagate the
    exception, so the function can safely write large bulks of files one-by-one.

    Args:
        file_path: the absolute path to the file.
        content: the new file content, i.e. the list of file lines.
    """
    try:
        with open(file_path, 'w') as f:
            for line in content:
                f.write(line)
    except EnvironmentError:
        print 'Cannot open/access file %s for writing', file_path


def _remove_final_where_necessary(line, file_content, line_index):
    """Removes all `final` keywords which refer to the local variables from the specified line.

    Most often there is only one such keyword, but the method can handle lines with multiple
    occurrences too.

    The method tries to recognize the scope in which the `final` modifier is applied and if the
    scope is a method, i.e. the keyword is applied to a local variable, removes it.

    Additionally, the method never removes `final` from the lines containing access modifier
    (`public`, `private`, `protected`), this serves as extra protection from removing the modifier
    from class fields.

    Args:
        line: the line to process.
        file_content: the file content, i.e. the list of file lines.
        line_index: the index of the line in the file content.

    Returns:
        str: the new line with the `final` keyword referring to local variables removed.
    """
    indices_where_remove = []
    for match in re.finditer('final ', line):
        index_of_final = match.start()
        if _is_removing_final_necessary(line, index_of_final, file_content, line_index):
            indices_where_remove.append(index_of_final)
    return _remove_final_keyword(line, indices_where_remove)


def _is_removing_final_necessary(line, index_of_final, file_content, line_index):
    """Checks if the `final` keyword at the specified index in the specified line should be removed.

    Always returns `False` for the lines containing access modifiers.

    Args:
        line: the line to process.
        index_of_final: the index where the `final` keyword is located in the line.
        file_content: the file content, i.e. the list of file lines.
        line_index: the index of the line in the file content.

    Returns:
        bool: `True` if the `final` keyword should be removed and `False` otherwise.
    """
    final_scope = _get_final_keyword_scope(line, index_of_final, file_content, line_index)
    return not _contains_access_modifier(line) and final_scope == 'method'


def _remove_final_keyword(line, indices_where_remove):
    """Removes the `final` keyword from the line at the specified indices.

    Returns the original line if the index list is empty.

    Removes the `final` keyword and also a space after it.

    Args:
        line: the line to remove keyword from.
        indices_where_remove: the indices where the `final` keywords to be removed are located.

    Returns:
        str: the line with the keyword deleted where necessary.
    """
    indices_for_removal = []
    for index in indices_where_remove:
        keyword_indices = range(index, index + len('final '))
        indices_for_removal.extend(keyword_indices)
    new_line = ''.join([s for i, s in enumerate(line) if i not in indices_for_removal])
    return new_line


def _contains_access_modifier(line):
    """Checks whether the line contains some Java access modifier in it.

    Args:
        line: the line to check.

    Returns:
        bool: `True` if the line contains access modifier and `False` otherwise.
    """
    return 'public ' in line or 'private ' in line or 'protected ' in line


def _get_final_keyword_scope(line, index_of_final, file_content, line_index):
    """Obtains the scope of the `final` keyword contained in the line.

    For the lines containing no `final` keyword, the method returns `undefined`.

    As it is relatively hard to determine that `final` belongs to a local variable, this function
    just searches for the other most common cases like class field declaration, class declaration,
    doc, etc. If the scope doesn't belong to one of them, the function by default assumes it is
    `method`.

    Args:
        line: the line to check.
        index_of_final: the index where the `final` keyword is located in the line.
        file_content: the file content, i.e. the list of file strings.
        line_index: the index of the line in the file content.

    Returns:
        str: the `final` keyword scope, for example: 'class', 'method', 'doc'.
    """
    if 'final ' not in line:
        return 'undefined'

    if _final_is_class_declaration(line):
        return 'class'

    if _final_is_comment(line, index_of_final) or _final_is_javadoc(line, index_of_final):
        return 'doc'

    if _final_is_string_literal(line, index_of_final):
        return 'literal'

    if _is_class_field(line_index, file_content):
        return 'class'

    return 'method'


def _final_is_class_declaration(line):
    """Checks whether the line containing `final` modifier is a class declaration.

    Returns `False` for the lines containing no `final` modifier.

    Args:
        line: the line to check.

    Returns:
        bool: `True` if the line is class declaration, `False` otherwise.
    """
    return 'final class ' in line


def _final_is_comment(line, index_of_final):
    """Checks whether the `final` modifier is inside a comment.

    Args:
        line: the line to check.
        index_of_final: the index where the `final` keyword is located in the line.

    Returns:
        bool: `True` if the `final` modifier is inside a comment and `False` otherwise.
    """
    return _final_is_inside_doc(line, index_of_final, '//')


def _final_is_javadoc(line, index_of_final):
    """Checks whether the `final` modifier is inside a Javadoc.

    Args:
        line: the line to check.
        index_of_final: the index where the `final` keyword is located in the line.

    Returns:
        bool: `True` if the `final` modifier is inside a Javadoc and `False` otherwise.
    """
    return _final_is_inside_doc(line, index_of_final, '*')


def _final_is_inside_doc(line, index_of_final, doc_start_symbol):
    """Checks whether the `final` modifier is inside a doc defined by starting symbol.

    Doc starting symbols can be, for example, `//` for the ordinary comment and `*` for the Javadoc.

    Args:
        line: the line to check.
        index_of_final: the index where the `final` keyword is located in the line.
        doc_start_symbol: the symbol defining where the code ends and the doc starts.

    Returns:
        bool: `True` if the `final` modifier is inside a doc and `False` otherwise.
    """
    if doc_start_symbol not in line:
        return False

    doc_start = line.find(doc_start_symbol)
    final_is_part_of_doc = index_of_final > doc_start
    return final_is_part_of_doc


def _final_is_string_literal(line, index_of_final):
    """Checks whether the `final` modifier is inside a string literal.

    Args:
        line: the line to check.
        index_of_final: the index where the `final` keyword is located in the line.

    Returns:
        bool: `True` if the `final` modifier is inside a literal and `False` otherwise.
    """
    if index_of_final <= 0:
        return False

    preceding_line = line[:index_of_final]
    quotes_count = preceding_line.count('"')
    there_is_unclosed_quote = quotes_count % 2 > 0
    return there_is_unclosed_quote


def _is_class_field(line_index, file_content):
    """Checks whether the line at the specified index is the class field declaration.

    Args:
        line_index: the index of the line to check.
        file_content: the file content, i.e. the list of file lines.

    Returns:
        bool: `True` if the line at the specified index is a class field and `False` otherwise.
    """
    scope_line_index, scope_line = _find_scope_defining_line(line_index, file_content)

    if scope_line is None:
        return False

    # Check `extends` and `implements` keywords to recognize class declarations like:
    #
    # class DefaultTenantRepository
    #    extends TenantRepository<Timestamp, DefaultTenantRepository.Entity> {
    #
    # Additionally check that `extends` is not a part of generic statement in method declaration
    # like in:
    #
    #     public Class<? extends Serializable> getTargetType() {
    if 'class ' in scope_line or 'implements ' in scope_line:
        return True

    if 'extends ' in scope_line:
        extends_is_class_declaration = not _extends_is_in_generic(scope_line, file_content,
                                                                  scope_line_index)
        return extends_is_class_declaration


def _find_scope_defining_line(line_index, file_content):
    """Finds the scope defining line for the line on the specified index.

    The scope defining line is the last line containing `{` that was not closed afterwards.

    If the scope defining line could not be found, returns (`-1`, `None`).

    Args:
        line_index: the index of the line for which to search.
        file_content: the file content, i.e. the list of file lines.

    Returns:
        int: the index of the scope defining line in the file content, or `-1`.
        str: the scope defining line, or `None`.
    """
    preceding_lines = file_content[:line_index]
    closed_bracket_count = 0
    for i, line in enumerate(reversed(preceding_lines)):
        if '}' in line:
            closed_bracket_count += 1
        if '{' in line:
            if closed_bracket_count > 0:
                closed_bracket_count -= 1
            else:
                index = i
                scope_defining_line = line
                return index, scope_defining_line
    return -1, None


def _extends_is_in_generic(line, file_content, line_index):
    """Checks whether the `extends` statement contained in the line is a part of the generic
    declaration.

    Example of the line which would pass the check:

        `private EventSubscriberClass(Class<? extends S> cls) {`

    Example of the line which would cause the method to return `False`:

        `public final class EventClass extends MessageClass {`

    For the lines without the 'extends' statement the method will always return `False`.

    Args:
        line: the line to check.
        file_content: the file content, i.e. the list of file lines.
        line_index: the index of the specified line in the file content.

    Returns:
        bool: `True` if `extends` is a part of the generic statement and `False` otherwise.
    """
    if 'extends ' not in line:
        return False

    index = line.find('extends ')
    before_extends = line[:index]

    opening_count = before_extends.count('<')
    closing_count = before_extends.count('>')

    preceding_lines = file_content[:line_index]
    for l in preceding_lines:
        opening_count += l.count('<')
        closing_count += l.count('>')
    return opening_count > closing_count


if __name__ == "__main__":
    main()
